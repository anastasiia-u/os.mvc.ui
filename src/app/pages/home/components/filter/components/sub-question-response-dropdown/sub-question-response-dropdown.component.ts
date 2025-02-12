import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectedQuestion } from '@app/core/models/question.model';
import { SubQuestionResponse } from '@app/core/models/sub-question-response.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsDropdownSubGroupOption } from '@cmi/os-library/components/cmi-os-dropdown-group';
import { CmiOsDropdownGroupLayeredComponent, CmiOsDropdownGroupLayeredOption, CmiOsDropdownGroupOption } from '@cmi/os-library/components/cmi-os-dropdown-group-layered';
import { Subscription, firstValueFrom } from 'rxjs';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
    selector: 'app-sub-question-response-dropdown',
    templateUrl: './sub-question-response-dropdown.component.html',
    styleUrls: ['./sub-question-response-dropdown.component.scss']
})
export class SubQuestionResponseDropdownComponent extends DefaultDropdownComponent implements OnInit, OnDestroy {
    @ViewChild('subQuestRespFilter')
    subQuestRespFilter!: CmiOsDropdownGroupLayeredComponent;

    subQuestionsResponses: SubQuestionResponse[] = [];

    defaultValues: number[] = [];

    private subscription: Subscription = Subscription.EMPTY;

    constructor(
        private filterService: FilterService,
        private surveyDataService: SurveyDataService) {
        super()
    }

    ngOnInit(): void {
        this.subscription = this.surveyDataService.questionIds$
            .subscribe((ids: number[]) => {
                this.updateSubQuestionsResponses(ids);
            });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    public subQuestionsResponsesChanged(ids: any): void {
        this.defaultValues = ids;
        this.surveyDataService.subQuestionResponseIds$.next(ids);
    }

    public reset(): void {
        this.subQuestionsResponsesChanged([]);
        this.subQuestionsResponses = [];
    }

    private async updateSubQuestionsResponses(selectedQuestionIds: number[]): Promise<void> {
        this.reset();

        if (!selectedQuestionIds.length) {
            return;
        }

        const selectedQuestions: SelectedQuestion = {
            surveyTypeId: this.surveyDataService.surveyTypeId$.value,
            questionIds: []
        };

        selectedQuestionIds.forEach(q =>
            selectedQuestions.questionIds.push(q)
        );

        const result = await firstValueFrom(this.filterService.loadSubQuestionsResponses(selectedQuestions));

        result.forEach(q => {
            const subQuestionResponse: CmiOsDropdownGroupLayeredOption = {
                id: q.id,
                name: q.name,
                hasGroupOptions: q.hasGroupOptions,
                isExpanded: true,
                groupOptions: [],
                subGroupOptions: []
            };

            q.groupOptions?.forEach(gOpt => {
                const groupOption: CmiOsDropdownGroupOption = {
                    id: gOpt.id,
                    name: gOpt.name,
                    isSelected: true,
                    isExpanded: true,
                    isDisabled: false,
                    options: []
                };

                if (gOpt.options) {
                    gOpt.options.forEach(opt => {
                        groupOption.options.push({
                            id: opt.id,
                            name: opt.name,
                            isSelected: true,
                            isDisabled: false
                        } as CmiOsDropdownSubGroupOption);
                    });
                }

                subQuestionResponse.groupOptions?.push(groupOption as CmiOsDropdownGroupOption);
            });

            q.subGroupOptions?.forEach(opt => {
                subQuestionResponse.subGroupOptions?.push({
                    id: opt.id,
                    name: opt.name,
                    isSelected: true,
                    isDisabled: false
                } as CmiOsDropdownSubGroupOption);
            });

            this.subQuestionsResponses.push(subQuestionResponse);
        });

        this.defaultValues = this.retrieveAllOptionIds();

        this.surveyDataService.subQuestionResponseIds$.next(this.defaultValues);

        this.dataLoaded();
    }

    private retrieveAllOptionIds(): Array<number> {
        const ids: number[] = [];

        this.subQuestionsResponses.forEach(q => {
            const groupOptions = q.groupOptions?.flatMap(gOpt => gOpt.options) || [];

            for (const opt of groupOptions) {
                ids.push(opt.id);
            }

            const subGroupOptions = q.subGroupOptions || [];

            for (const opt of subGroupOptions) {
                ids.push(opt.id);
            }
        });

        return ids;
    }
}