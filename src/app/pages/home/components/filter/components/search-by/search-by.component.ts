import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchSurveyResult } from '@app/core/models/search-survey-result.model';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { SearchComponent } from '@app/shared/search/search.component';
import { CmiOsFilterTypeButton } from '@cmi/os-library/components/cmi-os-filter-type';
import { SearchConstant } from './search-constant';

@Component({
    selector: 'app-search-by',
    templateUrl: './search-by.component.html',
    styleUrls: ['./search-by.component.scss']
})
export class SearchByComponent {
    @Output()
    surveyResult: EventEmitter<SearchSurveyResult> = new EventEmitter();

    public titleText = 'Search by';

    public searchByButtons: CmiOsFilterTypeButton[] = [
        { id: SearchConstant.NO_OPTION_SELECTED, name: "Category", isActive: true },
        { id: SearchConstant.HCP_OPTION, name: "Keyword", isActive: false }
    ];

    constructor(
        public dialog: MatDialog,
        private surveyDataService: SurveyDataService) {
    }

    searchByChanged(id: number) {
        if (id === SearchConstant.HCP_OPTION) {
            const dialogRef = this.dialog.open(SearchComponent,
                {
                    minHeight: 600, maxWidth: 1140, minWidth: 1140, disableClose: true, panelClass: 'search-dialog',
                    data: {
                        reportingPeriodId: this.surveyDataService.reportingPeriodId$.value,
                        surveyTypeId: this.surveyDataService.surveyTypeId$.value
                    },
                });

            dialogRef.afterClosed()
                .subscribe((result: SearchSurveyResult) => {
                    this.searchByButtons[SearchConstant.HCP_OPTION].isActive = false;
                    this.searchByButtons[SearchConstant.NO_OPTION_SELECTED].isActive = true;
                    this.surveyResult.emit(result);
                });
        }
    }
}
