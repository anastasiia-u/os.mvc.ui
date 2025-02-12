import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HcpTargetListResult } from '@app/core/models/hcp-target-list-result.model';
import { SearchSurveyResult } from '@app/core/models/search-survey-result.model';
import { EmpowerService } from '@app/core/services/empower.service';
import { ITrackingSurveyRequest, SurveyDataService } from '@app/core/services/survey-data.service';
import { firstValueFrom } from 'rxjs';
import { CategoryDropdownComponent } from './components/category-dropdown/category-dropdown.component';
import { DefaultDropdownComponent } from './components/default-dropdown.component';
import { FilterActionsComponent } from './components/filter-actions/filter-actions.component';
import { FilterConstant } from './components/filter-type/filter-constant';
import { FilterTypeComponent } from './components/filter-type/filter-type.component';
import { QuestionDropdownComponent } from './components/question-dropdown/question-dropdown.component';
import { ReportingPeriodDropdownComponent } from './components/reporting-period-dropdown/reporting-period-dropdown.component';
import { SpecialtyDropdownComponent } from './components/specialty-dropdown/specialty-dropdown.component';
import { SubQuestionResponseDropdownComponent } from './components/sub-question-response-dropdown/sub-question-response-dropdown.component';
import { SurveyTypeDropdownComponent } from './components/survey-type-dropdown/survey-type-dropdown.component';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  @Input()
  showFilters: boolean | undefined;

  @Input()
  sideNavOpen = true;

  @Output()
  sidebarState: EventEmitter<any> = new EventEmitter();

  @ViewChild('surveyType')
  surveyTypeDropdown: SurveyTypeDropdownComponent;

  @ViewChild('period')
  periodDropdown: ReportingPeriodDropdownComponent;

  @ViewChild('specialty')
  specialtyDropdown!: SpecialtyDropdownComponent;

  @ViewChild('category')
  categoryDropdown: CategoryDropdownComponent;

  @ViewChild('question')
  questionDropdown: QuestionDropdownComponent;

  @ViewChild('subQuestionResponse')
  subQuestionResponseDropdown: SubQuestionResponseDropdownComponent;

  @ViewChild('filterType')
  filterType: FilterTypeComponent;

  @ViewChild('filterAction')
  filterAction: FilterActionsComponent;

  previousSurveyTypeId: number;

  constructor(
    private surveyService: SurveyDataService,
    private empowerService: EmpowerService
  ) {
    this.surveyService.trackingQuery$.subscribe(async data => {
      if (data) {
        await this.populateFilter(data)
      }
    });

    this.surveyService.surveyTypeId$.subscribe(async surveyTypeId => {
      if (surveyTypeId && this.previousSurveyTypeId !== surveyTypeId) {
        this.previousSurveyTypeId = surveyTypeId;
        await this.filterType.ngOnInit();
        this.resetControls(true);
      }
    });
  }

  get hideSpecialtyDropdown() {
    return this.surveyService.isConsumerSurveyType();
  }

  toggleFilterSection = (): void => {
    this.showFilters = !this.showFilters;
    this.sidebarState.emit(this.showFilters);
  };

  resetControls(force: boolean = false) {
    this.controls(force).forEach(control => {
      control.reset();
    });
    this.surveyService.clearResults();
    this.surveyService.openSaveResult$.next(null);
    this.surveyService.resetDone$.next(true);
  }

  applySurveyResult(result: SearchSurveyResult) {

    const previousSelectedQuestions = this.questionDropdown.defaultQuestions;

    this.categoryDropdown.categoriesChanged([...new Set([... this.categoryDropdown.defaultCategories, ...result.catagoryIdList])]);

    this.questionDropdown.dataLoaded = () => {
      // eslint-disable-next-line 
      this.questionDropdown.dataLoaded = function () { };
      this.questionDropdown.questionsChanged([...new Set([...previousSelectedQuestions, ...result.questionIdList])]);
      this.subQuestionResponseDropdown.subQuestionsResponsesChanged([...new Set([... this.subQuestionResponseDropdown.defaultValues, ...result.subQuestionResponseIdList])]);
    };
  }

  seeResult() {
    this.showFilters = false;
    this.sidebarState.emit(this.showFilters);
  }

  hasResults(): boolean {
    return this.surveyService.surveyData$.value.categories.length > 0;
  }

  reportingPeriodChanged() {
    this.specialtyDropdown?.reset();
    this.filterType.reset();
  }

  async populateFilter(data: ITrackingSurveyRequest) {

    if (!this.surveyTypeDropdown.updateSurveyType(data.filterData.surveyTypeId)) {
      if (!this.periodDropdown.updateReportingPeriod(data.filterData.reportingPeriodId)) {
        this.categoryDropdown.categoriesChanged(data.filterData.categoryIds);
      }
    }

    this.periodDropdown.dataLoaded = () => {
      this.periodDropdown.dataLoaded = function () { };
      this.periodDropdown.updateReportingPeriod(data.filterData.reportingPeriodId);
    };

    this.categoryDropdown.dataLoaded = () => {
      // eslint-disable-next-line 
      this.categoryDropdown.dataLoaded = function () { };
      this.categoryDropdown.categoriesChanged(data.filterData.categoryIds);
    };

    this.questionDropdown.dataLoaded = () => {
      // eslint-disable-next-line 
      this.questionDropdown.dataLoaded = function () { };
      this.questionDropdown.questionsChanged(data.filterData.questionIds);
    };

    this.subQuestionResponseDropdown.dataLoaded = async () => {
      // eslint-disable-next-line 
      this.subQuestionResponseDropdown.dataLoaded = function () { };
      this.subQuestionResponseDropdown.subQuestionsResponsesChanged(data.filterData.answerIds);
      await this.populateFilterTypes(data);

      this.specialtyDropdown?.updateDefaultValues(data.filterData.specialtyIds);
      this.specialtyDropdown?.medicalSpecialtiesChanged(data.filterData.specialtyIds);

      if (!this.filterAction.isSeeResultsDisabled) {
        this.filterAction.loadSurveyResults();
      }
    };
  }

  private async populateFilterTypes(data: ITrackingSurveyRequest) {
    if (data.filterData.collectionId) {
      switch (data.filterData.collectionId) {
        case FilterConstant.AMA_OPTION.toString():
          this.filterType.autoSetFilterType(FilterConstant.AMA_OPTION);
          break;
        case FilterConstant.NPI_OPTION.toString():
          this.filterType.autoSetFilterType(FilterConstant.NPI_OPTION);
          break;
        case FilterConstant.EMPOWER_OPTION.toString():
          this.filterType.autoSetFilterType(FilterConstant.EMPOWER_OPTION);
          break;
        case FilterConstant.PANEL_OPTION.toString():
          this.filterType.autoSetFilterType(FilterConstant.PANEL_OPTION);
          break;
        default:
          this.filterType.autoSetFilterType(FilterConstant.HCP_OPTION);

          const hcp = new HcpTargetListResult();

          hcp.collection = data.filterData.collectionId;

          hcp.name = data.targetListName as string;

          try {
            const targetListResponse = await firstValueFrom(this.empowerService.getTargetListByCollectionId(data.filterData.collectionId));
            hcp.count = targetListResponse.hcpCount;
            this.surveyService.hcpTargetList$.next(hcp);
          } catch {
            hcp.inactive = true;
            this.surveyService.hcpTargetList$.next(hcp);
          }
          break;
      }
    }
  }

  private controls(force: boolean = false): DefaultDropdownComponent[] {

    let conrols = [];

    if (!force) {
      conrols.push(this.surveyTypeDropdown);
    }

    return [...conrols, this.periodDropdown, this.categoryDropdown, this.questionDropdown, this.subQuestionResponseDropdown, this.filterType];
  }
}