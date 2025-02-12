import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectedCategory } from '@app/core/models/categories.model';
import { SubQuestionResponse } from '@app/core/models/sub-question-response.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsDropdownGroupComponent } from '@cmi/os-library/components/cmi-os-dropdown-group';
import { Subscription, firstValueFrom } from 'rxjs';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
  selector: 'app-question-dropdown',
  templateUrl: './question-dropdown.component.html',
  styleUrls: ['./question-dropdown.component.scss']
})
export class QuestionDropdownComponent extends DefaultDropdownComponent implements OnInit, OnDestroy {

  @ViewChild('quesFilter')
  quesFilter!: CmiOsDropdownGroupComponent;

  questions: SubQuestionResponse[] = [];

  defaultQuestions: number[] = [];

  private subscription: Subscription = Subscription.EMPTY;

  constructor(
    private filterService: FilterService,
    private surveyDataService: SurveyDataService) {
    super()
  }

  ngOnInit(): void {
    this.subscription = this.surveyDataService.categoryIds$
      .subscribe((ids: number[]) => {
        this.updateQuestions(ids);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public questionsChanged(ids: any): void {
    this.defaultQuestions = ids;
    this.surveyDataService.questionIds$.next(ids);
  }

  public reset(): void {
    this.questionsChanged([]);
    this.questions = [];
  }

  private async updateQuestions(selectedCategoryIds: number[]): Promise<void> {
    this.reset();

    if (!selectedCategoryIds.length) {
      return;
    }

    const selectedCategory: SelectedCategory =
    {
      surveyTypeId: this.surveyDataService.surveyTypeId$.value,
      reportingPeriodId: this.surveyDataService.reportingPeriodId$.value,
      categoryIds: [...selectedCategoryIds]
    };

    const result = await firstValueFrom(this.filterService.loadQuestions(selectedCategory));

    this.questions = result.map(q => {

      return {
        id: q.id,
        name: q.name,
        hasGroupOptions: false,
        isExpanded: true,
        groupOptions: [],
        subGroupOptions: q.options.map(r => {
          return {
            id: r.id,
            name: r.name,
            isSelected: false,
            isDisabled: false
          }
        })
      }
    });

    this.dataLoaded();
  }
}
