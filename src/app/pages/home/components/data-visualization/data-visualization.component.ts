import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { GeneralSectionName, SurveySectionSettings } from '@app/core/constants/survey-section-settings';
import { QuestionType } from '@app/core/enums/question-type';
import { ChartFiltersData } from '@app/core/models/chart-fillters-data';
import { SurveyCardItemResult } from '@app/core/models/survey-card-item';
import { SurveySection } from '@app/core/models/survey-section.model';
import { IChartFilterBreakdown } from '@app/core/models/surveyChartFilterBreakdown';
import { FilterService } from '@app/core/services/filter.service';
import { IChartLayerData, ISurveyAnswer, ISurveyCategory, ISurveyQuestion, ISurveyResponse, ISurveySubQuestion, SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsCardLayeredDataVisualizationInput } from '@app/shared/components/cmi-os-card-layered-data-visualization/cmi-os-card-layered-data-visualization.model';
import { ViewTypes } from '@app/shared/components/view-selector/view-types';
import { CmiOsCardDataVisualizationInput, CmiOsCardTableViewInput } from '@cmi/os-library/components/cmi-os-card-data-visualization';
import { CmiOsGlobalLoadingService } from '@cmi/os-library/components/cmi-os-global-loading';
import { CmiOsTableViewColumnItem } from '@cmi/os-library/components/cmi-os-table-view';
import { CmiOsDataExportService } from '@cmi/os-library/services/cmi-os-data-export';
import { CmiOsDataFormattingService } from '@cmi/os-library/services/cmi-os-data-formatting';
import { SurveyType } from '../../../../core/enums/survey-type.enum';
import { FilterConstant } from '../filter/components/filter-type/filter-constant';
import { ViewDataType } from './../../../../core/enums/view-data-type';

@Component({
  selector: 'app-data-visualization',
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.scss'],
})
export class DataVisualizationComponent implements OnInit, OnChanges {

  @Input() updateDataVisualization: number = 0;

  //readonly MaxAnswerNameLength = 81;

  readonly MultiChoiceQuestionType = 'MC';

  _multiLayersInput: Array<IChartLayerData> = [];

  surveySections: SurveySection[] = [];

  layerChartTableData: any;

  chartFiltersData: ChartFiltersData[] = [];

  viewType: ViewTypes = ViewTypes.BarChart;
  _currentViewDataType: ViewDataType = ViewDataType.Percentage;

  constructor(
    private surveyDataService: SurveyDataService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private exportService: CmiOsDataExportService,
    private dataFormattingService: CmiOsDataFormattingService,
    private loaderService: CmiOsGlobalLoadingService,
    private filterService: FilterService
  ) {
  }

  ngOnInit() {
    this.initSurveySections();

    this.surveyDataService.surveyData$
      .subscribe((response: ISurveyResponse) => {

        if (response.categories.length) {
          this.loadChartFilters();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.exportService.clear();
        this.mapResponseAndDisplaySurveyResults(response);
        this.surveyDataService.surveySections$.next(this.surveySections);

        // update export button availability
        this.updateExportAvailability();
      })
  }

  ngOnChanges(changes: SimpleChanges) {

    // Update Export button
    if (changes['updateDataVisualization']) {
      this.updateExportAvailability();
    }
  }
  updateExportAvailability() {
    // update export button availability
    this.surveySections.forEach(item => {
      if (item.fullWidthResults.length > 0) {
        item.fullWidthResults.forEach((x, idx) => {
          x.card['isExportAvailable'] = (idx == 0);
        });
      }
    });
  }

  onViewModeChanged(viewType: ViewTypes) {
    this.viewType = viewType;
  }


  private initSurveySections(): void {
    const auxSurveySection: SurveySection[] = [];

    SurveySectionSettings.forEach(kSection => {
      const section = new SurveySection();

      section.id = kSection.id;
      section.htmlId = 'surveySection_' + kSection.id;
      section.name = kSection.name;
      section.icon = kSection.icon;

      this.matIconRegistry.addSvgIcon(
        section.icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/images/survey-navbar/${kSection.icon}.svg`)
      );

      auxSurveySection.push(section);
    });

    this.surveySections = auxSurveySection.sort((a, b) => a.position < b.position ? -1 : a.position > b.position ? 1 : 0);
  }
  private mapResponseAndDisplaySurveyResults(response: ISurveyResponse): void {
    this.surveySections.forEach(section => {
      section.clear();

      const mappedCategories = response.categories.filter(x => x.sectionName === section.name);

      this.addToSection(section, mappedCategories);
    });

    this.addUnmappedCategoriesToGeneralSection(response);
  }
  private addUnmappedCategoriesToGeneralSection(result: ISurveyResponse): void {
    const surveySections = this.surveySections.map(x => x.name);

    const notMappedCategories = result.categories.filter(x => !surveySections.includes(x.sectionName));

    if (notMappedCategories.length) {
      const generalSection = this.surveySections.find(x => x.name === GeneralSectionName) as SurveySection;

      this.addToSection(generalSection, notMappedCategories);
    }
  }
  private addToSection(section: SurveySection, categories: ISurveyCategory[]): void {
    categories.forEach((category) => {
      section.isLoading = true;
      section.isVisible = true;

      category.questions.forEach((question) => {

        const cartItem = this.createCardItemReult(question, section, category);
        cartItem.question = question;

        section.fullWidthResults.push(cartItem);

      });
    });
  }

  private createCardItemReult(question: ISurveyQuestion, section: SurveySection, category: ISurveyCategory, breakdownType: number = 0) {
    const isAverage = this.isAverageQuestion(question);
    const cartItem = new SurveyCardItemResult({
      question: question,

      isLoading: true,
      sectionName: section.name,
      questionId: question.id,
      categoryId: category.id,
      answerIds: this.getAnswerIds(question),
      questionType: question.questionType,
      isAverage: isAverage,

      layers: null,
      card: this.createCard(category, question, section, breakdownType),

      viewType: null,
      viewDataType: ViewDataType.Percentage,
    });
    return cartItem;
  }
  private getAnswerIds(question: ISurveyQuestion): number[] {

    if (!question.answers[0].subQuestions.length) {
      return question.answers?.map(x => x.id) ?? [];
    }

    let answerIds: number[] = [];

    question.answers[0]?.subQuestions.forEach(q => {

      if (q.specialities.length) {
        answerIds.push(...q.answerIds);

      } else {
        answerIds.push(...q.answers.map(x => x.id))
      }
    });

    return answerIds;
  }
  private createCard(category: ISurveyCategory, question: ISurveyQuestion, section: SurveySection, breakdownType: number = 0): CmiOsCardDataVisualizationInput | CmiOsCardLayeredDataVisualizationInput {
    const answers = question.answers;
    const answer = answers[0];

    const hasSubquestions = answer.subQuestions.length > 0;

    const auxCardInput = hasSubquestions ? new CmiOsCardLayeredDataVisualizationInput() : new CmiOsCardDataVisualizationInput();

    auxCardInput.translations.cardTitleLabel = '';
    auxCardInput.translations.cardAreaSubtitleLabel = 'Question';
    auxCardInput.translations.cardAreaResumeTitleLabel = 'Audience';
    auxCardInput.translations.cardAreaResumeTotalLabel = 'Universe Audience = ';
    auxCardInput.translations.cardAreaAggregationResetLabel = 'Reset';

    auxCardInput.translations.audienceTooltipText = this.getAudienceTooltipText(this.surveyDataService.filterType$.value);
    auxCardInput.translations.universeTooltipText = this.getUniverseTooltipText(this.surveyDataService.filterType$.value);;

    auxCardInput.cardTitle = category.value;
    auxCardInput.cardPeriod = this.surveyDataService.reportingPeriodId$.value.toString();
    auxCardInput.isViewModeChart = true;

    auxCardInput.referenceId = `chartId_${question.id}`;
    auxCardInput.htmlContainerId = `htmlChartId_${question.id}`;

    auxCardInput.title = question.value;
    auxCardInput.exportTitle = question.value;
    auxCardInput.sectionName = section.name;
    auxCardInput.exportAllTitle = "Media Vitals";
    auxCardInput.isExportAvailable = true;

    auxCardInput.aggregationColumnName = question.questionType !== this.MultiChoiceQuestionType && !this.isAverageQuestion(question) ? 'percent' : '';

    auxCardInput.totalAudienceValue = question.audienceCount.toString();
    auxCardInput.totalUniverseValue = question.universeCount.toString();


    // MANAGE TABLE INFO
    const table = new CmiOsCardTableViewInput();
    table.exportTitle = question.value;
    table.referenceId = `chartId_${question.id}`;
    table.groupHtmlContainerId = section.htmlId;
    table.htmlContainerId = `htmlChartId_${question.id}`;
    table.title = question.value;
    table.sectionName = section.name;
    table.messageNoData = 'No data available.';


    // Handle data received from api
    if (question.questionType == QuestionType.GridSingleChoise || question.questionType == QuestionType.GridMultipleChoise) {
      let questionInfo: any = {};
      if (question.questionType == QuestionType.GridSingleChoise && this.isAverageQuestion(question) && !answers[0].subQuestions.length) {
        questionInfo = this.getByQuestionTypeSC_or_MC(question, this._currentViewDataType);
      }
      else {
        questionInfo = this.getByQuestionTypeGSC_or_GMC(question, ViewDataType.Count);
      }
      table.columns = questionInfo.columns;
      table.data = questionInfo.data;
    }
    else if (question.questionType == QuestionType.SingleChoise || question.questionType == QuestionType.MultipleChoise) {
      const questionInfo = this.getByQuestionTypeSC_or_MC(question, this._currentViewDataType);
      table.columns = questionInfo.columns;
      table.data = questionInfo.data;
    }

    auxCardInput.tableInput = table


    return auxCardInput;
  }


  private getByQuestionTypeGSC_or_GMC(question: ISurveyQuestion, viewDataType: ViewDataType) {
    const isAverageQuestion = this.isAverageQuestion(question);
    const hasSubQuestions = question.answers.some(answer => answer.subQuestions.length);

    // // Check if the question has subquestions
    // if(question.answers[0].subQuestions.length>0){
    //   // Format => Answers will be the columns
    //   // Format => Subquestions will be the rows

    const dataColumns: any[] = question.answers.map(x => ({ id: x.id, value: x.value }));
    const dataRows: any[] = question.answers[0].subQuestions.map(x => ({ id: x.id, value: x.value }));

    const tableColumns: CmiOsTableViewColumnItem[] = [];
    const tableData: any[] = [];


    // Api returns data duplicate per each column
    // SO we only need to use 1 answer
    const dataSource: ISurveyAnswer = question.answers[0];

    dataRows.forEach((itemRow, idxRow) => {
      let row = {} as any;
      row['name'] = itemRow.value;

      // < > Create information about columns to export
      if (idxRow == 0) {
        if (isAverageQuestion)
          tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: 'Question', isNumber: false, order: 0, isToHide: true, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));

        if (hasSubQuestions)
          tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: 'Sub-Questions', isNumber: false, order: 0, isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));
      }
      // </> Create information about columns to export


      const tempSubquestion = dataSource.subQuestions.find(x => x.id == itemRow.id);
      dataColumns.forEach((itemColumn, idxColumn) => {
        const tempAnswer = tempSubquestion?.answers.find(x => x.value == itemColumn.value);

        // < > Create information about columns to export
        if (idxRow == 0)
          tableColumns.push(new CmiOsTableViewColumnItem({ width: (hasSubQuestions ? '15%' : 'auto'), property: 'item' + (idxColumn + 1), label: itemColumn.value, isNumber: true, order: (idxColumn + 1), isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: !isAverageQuestion ? '%' : '', columnType: 0 }));
        // </> Create information about columns to export

        row['item' + (idxColumn + 1)] = row['count'] =
          (viewDataType == ViewDataType.Count)
            ? tempAnswer?.count
            : (viewDataType == ViewDataType.Percentage)
              ? tempAnswer?.percent
              : '';
      });

      tableData.push(row);
    });

    // return data + columns
    return ({ data: tableData, columns: tableColumns });
  }

  private getByQuestionTypeSC_or_MC(question: ISurveyQuestion, viewDataType: ViewDataType) {
    const isAverageQuestion = this.isAverageQuestion(question);

    const tableColumns: CmiOsTableViewColumnItem[] = [];
    const tableData: any[] = [];

    // < > Create information about columns to export
    tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: (isAverageQuestion ? 'Question' : 'Response'), isNumber: false, order: 0, isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));
    tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'count', label: '#', isNumber: true, order: 1, isToHide: (viewDataType != ViewDataType.Count), isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));
    tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'percentage', label: '%', isNumber: true, order: 2, isToHide: (viewDataType != ViewDataType.Percentage), isToExport: true, valuePrefix: '', valueSuffix: '%', columnType: 0 }));
    // </> Create information about columns to export

    question.answers.forEach(itemRow => {
      let row = {} as any;
      row['name'] = itemRow.value;
      row['count'] = itemRow.count;
      row['percentage'] = itemRow.percent;

      tableData.push(row);
    });

    // return data + columns
    return ({ data: tableData, columns: tableColumns });
  }

  private isAverageQuestion(question: ISurveyQuestion): boolean {
    const answerName = question.answers[0].value;
    const questionType = question.questionType;

    if (!questionType) {
      return answerName.toUpperCase() === 'AVERAGE';
    }

    return questionType === QuestionType.GridSingleChoise && answerName.toUpperCase() === 'AVERAGE';
  }

  UniversalLabelText(): string {
    switch (this.surveyDataService.surveyTypeId$.value) {
      case SurveyType.Consumer:
        return 'Consumers';
      case SurveyType.Payer:
        return 'FDMs';
      default: return 'HCPs';
    }
  }

  isProfessionalSurveyType(): boolean {
    return this.surveyDataService.isProfessionalSurveyType();
  }

  // onFilterChanged(filters: IChartFilterResults[], cardItem: SurveyCardItemResult) {
  onFilterChanged(filterBreakdown: IChartFilterBreakdown, cardItem: SurveyCardItemResult) {
    this.surveyDataService.loadSingleChart(filterBreakdown.filters, cardItem.categoryId, cardItem.questionId, cardItem.answerIds, filterBreakdown.breakdownType)
      .subscribe(data => {
        const section = this.surveySections.find(x => x.name == cardItem.sectionName) as SurveySection;

        const newCardItem = this.createCardItemReult(data.categories[0].questions[0], section, data.categories[0], filterBreakdown.breakdownType);

        newCardItem.card.isViewModeChart = cardItem.card.isViewModeChart;

        cardItem.card = newCardItem.card;
        cardItem.question = data.categories[0].questions[0];

        // cardItem.layers = newCardItem.layers;
      });
  }

  onFilterBreakdownChanged(filterBreakdown: IChartFilterBreakdown, cardItem: SurveyCardItemResult) {
    this.surveyDataService.loadSingleChart(filterBreakdown.filters, cardItem.categoryId, cardItem.questionId, cardItem.answerIds, filterBreakdown.breakdownType)
      .subscribe(data => {

        const section = this.surveySections.find(x => x.name == cardItem.sectionName) as SurveySection;

        const newCardItem = this.createCardItemReult(data.categories[0].questions[0], section, data.categories[0], filterBreakdown.breakdownType);

        newCardItem.card.isViewModeChart = cardItem.card.isViewModeChart;

        cardItem.card = newCardItem.card;

        cardItem.layers = newCardItem.layers;
      });
  }





  private loadChartFilters() {

    this.filterService.loadChartFiltersData({
      reportingPeriodId: this.surveyDataService.reportingPeriodId$.value,
      surveyTypeId: this.surveyDataService.surveyTypeId$.value
    }).subscribe(data => {
      this.chartFiltersData = data;
    });
  }





  private updateTableByQuestionTypeSC_or_MC(table: CmiOsCardTableViewInput, question: ISurveyQuestion) {

    const tableData: any[] = [];
    question.answers.forEach(answer => {
      tableData.push({
        id: answer.id,
        name: answer.value,
        order: answer.order,
        count: answer.count,
        percentage: answer.percent,
        percentageFormatted: answer.percentFormatted,
        index: answer.indexVal,
      });
    });

    const tableColumns: CmiOsTableViewColumnItem[] = [];
    tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: 'Response', isNumber: false, order: 0, isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));
    tableColumns.push(new CmiOsTableViewColumnItem({ width: '10%', property: 'count', label: '#', isNumber: true, order: 2, isToHide: true, isToExport: true, valuePrefix: '', valueSuffix: '%', columnType: 0 }));
    tableColumns.push(new CmiOsTableViewColumnItem({ width: '10%', property: 'percentageFormatted', label: '%', rawValue: 'percentage', isNumber: true, order: 3, isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: '%', columnType: 0 }));
    tableColumns.push(new CmiOsTableViewColumnItem({ width: '10%', property: 'index', label: 'IDX', isNumber: true, order: 4, isToHide: true, isToExport: false, valuePrefix: '', valueSuffix: '', columnType: 0 }));


    // Update table
    table.columns = tableColumns;
    table.data = tableData;

    table.propertyCount = "count";
    table.propertyIndex = "index";
    table.propertyPercentage = "percentage";

    // OBS => The sort should be inherited from Dropdown SortedBy
    // table.sortField = 'order';
    // table.sortFieldOrder = 'ASC';


  }




  private calculateAverageCount(subQuestion: ISurveySubQuestion): any {
    const count = subQuestion.specialities.length;
    if (!count) {
      return subQuestion.count;
    }
    let sum = 0;
    subQuestion.specialities.forEach(item => {
      sum += item.count;
    });
    return Math.round(sum / count);
  }
  private calculateTotalCount(subQuestion: ISurveySubQuestion): any {
    const count = subQuestion.specialities.length;
    if (!count) {
      return subQuestion.count;
    }
    let sum = 0;
    subQuestion.specialities.forEach(item => {
      sum += item.count;
    });
    return sum;
  }

  // Generate table chart data for question with subquestions
  private generateTableChartSubQuestionData(answers: ISurveyAnswer[], subQuestionName: string, questionName?: string): any[] {
    const data = [] as any[];
    if (answers.length) {
      const addItem = (subQuestion: ISurveySubQuestion, name: string, answerIndex: number) => {
        const item = {} as any;
        item.name = name;
        item.questionName = questionName;
        item.subquestionName = subQuestionName;
        item.isMain = true;
        item.category = `Group ${answerIndex}`;
        item.item1 = subQuestion.count;
        item.item2 = subQuestion.percentFormatted;
        // item.item3 = subQuestion.answers[answerIndex].indexVal;
        item.order = subQuestion.answers[answerIndex].order;


        // < > All tables/charts should have these fields: 'count' & 'percentage'
        item.count = subQuestion.count;
        item.percentage = subQuestion.percent;
        // </> All tables/charts should have these fields: 'count' & 'percentage'

        data.push(item);
      }

      const subQuestion = answers[0].subQuestions.find(subQ => subQ.value === subQuestionName);

      if (subQuestion) {
        for (let i = 0; i < subQuestion.answers.length; i++) {

          const subQuestionAnswer = answers.find(x => x.value === subQuestion.answers[i].value)?.subQuestions?.find(subQ => subQ.value === subQuestionName) as ISurveySubQuestion;

          addItem(subQuestionAnswer, subQuestion.answers[i].value, i);
        }
      }
    }

    return data;
  }

  // Generate table data for question without subquestions/specialities
  private generateTableQuestionData(answers: ISurveyAnswer[]): any[] {
    const item = {} as any;
    item.name = ``;
    item.isMain = true;
    item.category = `MainCategory`;

    for (let j = 0; j < answers.length; j++) {
      const propName = `item${j + 1}`;
      item[propName] = answers[j].percentFormatted;
    }

    return [item];
  }

  // Generate table chart data for question without subquestions/specialities
  private generateTableChartQuestionData(answers: ISurveyAnswer[]): any[] {
    const data = [] as any[];

    for (let j = 0; j < answers.length; j++) {
      const item = {} as any;
      item.name = answers[j].value;
      item.isMain = true;
      item.category = `MainCategory`;
      item.item1 = answers[j].count;
      item.item2 = answers[j].percentFormatted;
      // item.item3 = answers[j].indexVal;
      item.order = answers[j].order;

      // < > All tables/charts should have these fields: 'count' & 'percentage'
      item.count = answers[j].count;
      item.percentage = answers[j].percent;
      // < > All tables/charts should have these fields: 'count' & 'percentage'

      data.push(item);
    }

    return data;
  }

  // Generate table data for question only with specialities
  private generateTableSpecQuestionData(answers: ISurveyAnswer[]): any[] {
    const data = [] as any[];

    const specialties = Array.from(
      new Set(
        answers.flatMap(answer => answer.specialities.map(spec => spec.value))
      )
    );

    const createObject = (name: string, isMain: boolean) => {
      const object: any = { name, isMain, category: 'MainCategory' };
      answers.forEach((answer, i) => {
        object[`item${i + 1}`] = answer.specialities
          .find(spec => spec.value === name)?.percentFormatted ?? answer.percentFormatted;
      });

      return object;
    };

    data.push(createObject('', true));

    specialties.forEach(spec => {
      data.push(createObject(spec, false));
    });

    return data;
  }

  // Generate table chart data for question with specialities and sub questions
  private generateTableChartSpecSubQuestionData(answers: ISurveyAnswer[], subQuestionName: string, questionName?: string): any[] {
    const data = [] as any[];
    if (answers.length) {
      const addItem = (name: string, isSub: boolean, answerIndex: number, specialtyIndex: number) => {
        const item = {} as any;
        item.name = name;
        item.questionName = isSub ? questionName : '';
        item.subquestionName = isSub ? subQuestionName : '';
        item.isMain = isSub;
        item.category = `Group ${answerIndex}`;
        item.item1 = isSub ? updatedAnswers[answerIndex].count : updatedAnswers[answerIndex].subQuestions[0].specialities[specialtyIndex].count;
        item.item2 = isSub ? updatedAnswers[answerIndex].percentFormatted : updatedAnswers[answerIndex].subQuestions[0].specialities[specialtyIndex].percentFormatted;
        // item.item3 = isSub ? updatedAnswers[answerIndex].indexVal : updatedAnswers[answerIndex].subQuestions[0].specialities[specialtyIndex].indexVal;
        item.hasSpecialities = isSub;

        // < > All tables/charts should have these fields: 'count' & 'percentage'
        item.count = isSub ? updatedAnswers[answerIndex].count : updatedAnswers[answerIndex].subQuestions[0].specialities[specialtyIndex].count;
        item.percentage = isSub ? updatedAnswers[answerIndex].percent : updatedAnswers[answerIndex].subQuestions[0].specialities[specialtyIndex].percent;
        // </> All tables/charts should have these fields: 'count' & 'percentage'


        data.push(item);

        return item;
      }

      // Filtered answers by subQuestionName
      const updatedAnswers = answers.map(answer => {
        return {
          ...answer,
          subQuestions: answer.subQuestions.filter(subQuestion => subQuestion.value === subQuestionName),
        };
      });

      for (let i = 0; i < updatedAnswers.length; i++) {
        let item = addItem(updatedAnswers[i].value, true, i, 0);
        let count = 0;
        let percent = 0;
        for (let j = 0; j < updatedAnswers[i].subQuestions[0].specialities.length; j++) {
          const subItem = addItem(updatedAnswers[i].subQuestions[0].specialities[j].value, false, i, j);
          count += subItem.item1;
          percent += subItem.percent;
        }
        item.item1 = count;
        item.item2 = Math.round(percent);

        // < > All tables/charts should have these fields: 'count' & 'percentage'
        item.count = count;
        item.percentage = Math.round(percent);
        // </> All tables/charts should have these fields: 'count' & 'percentage'
      }
    }

    return data;
  }

  // Generate table chart data for question with specialities
  private generateTableChartSpecQuestionData(answers: ISurveyAnswer[]): any[] {
    const data = [] as any[];
    if (answers.length) {
      const addItem = (name: string, isSub: boolean, answerIndex: number, specialtyIndex: number) => {
        const item = {} as any;
        item.name = name;
        item.isMain = isSub;
        item.category = `Group ${answerIndex}`;
        item.item1 = isSub ? answers[answerIndex].count : answers[answerIndex].specialities[specialtyIndex].count;
        item.item2 = isSub ? answers[answerIndex].percentFormatted : answers[answerIndex].specialities[specialtyIndex].percentFormatted;
        // item.item3 = isSub ? answers[answerIndex].indexVal : answers[answerIndex].specialities[specialtyIndex].indexVal;
        item.hasSpecialities = isSub;

        // < > All tables/charts should have these fields: 'count' & 'percentage'
        item.count = isSub ? answers[answerIndex].count : answers[answerIndex].specialities[specialtyIndex].count;
        item.percentage = isSub ? answers[answerIndex].percent : answers[answerIndex].specialities[specialtyIndex].percent;
        // </> All tables/charts should have these fields: 'count' & 'percentage'

        data.push(item);
      }

      for (let i = 0; i < answers.length; i++) {
        addItem(answers[i].value, true, i, 0);
        for (let j = 0; j < answers[i].specialities.length; j++) {
          addItem(answers[i].specialities[j].value, false, i, j);
        }
      }
    }

    return data;
  }

  private getAudienceTooltipText(filterType: number): string {

    const audience = this.getAudienceText();

    switch (filterType) {
      case FilterConstant.PANEL_OPTION:
        return `Total # of ${audience} in the survey for the reporting period selected who answered this question. Under 30 use lightly, 30-90 directional, over 90 strong data`;
      case FilterConstant.AMA_OPTION:
        return 'Total # of HCPs in the survey for the reporting period that are also within the AMA dataset who answered this question. Under 30 use lightly, 30-90 directional, over 90 strong data';
      case FilterConstant.NPI_OPTION:
        return 'Total # of HCPs in the survey for the reporting period that are also within the NPI dataset who answered this question. Under 30 use lightly, 30-90 directional, over 90 strong data';
      case FilterConstant.HCP_OPTION:
        return 'Total # of HCPs in the survey for the reporting period that are also within the HCP Target List selected who answered this question. Under 30 use lightly, 30-90 directional, over 90 strong data';
      case FilterConstant.EMPOWER_OPTION:
        return 'Total # of HCPs in the survey for the reporting period that are also within the CMI dataset who answered this question. Under 30 use lightly, 30-90 directional, over 90 strong data';
      default: return '';
    }
  }

  private getUniverseTooltipText(filterType: number): string {

    const audience = this.getAudienceText();

    switch (filterType) {
      case FilterConstant.PANEL_OPTION:
        return `Total # of ${audience} in the survey for the reporting period selected`;
      case FilterConstant.AMA_OPTION:
        return 'Total # of HCPs in the survey for the reporting period selected that are also within the AMA dataset';
      case FilterConstant.NPI_OPTION:
        return 'Total # of HCPs in the survey for the reporting period selected that are also within the NPI dataset';
      case FilterConstant.HCP_OPTION:
        return 'Total # of HCPs in the survey for the reporting period selected that are also associated with an HCP Target List.';
      case FilterConstant.EMPOWER_OPTION:
        return 'Total # of HCPs in the survey for the reporting period selected that are also within the CMI dataset';
      default: return '';
    }
  }
  private getAudienceText() {
    switch (this.surveyDataService.surveyTypeId$.value) {
      case SurveyType.Consumer:
        return 'Consumers';
      case SurveyType.Payer:
        return 'Payers & Hospitals';
      default: return 'HCPs';
    }
  }
}
