import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Category } from '@app/core/models/categories.model';
import { SelectedReportingPeriod } from '@app/core/models/reporting-period.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsDropdownSimpleComponent } from '@cmi/os-library/components/cmi-os-dropdown-simple';
import { Subscription } from 'rxjs';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
  selector: 'app-category-dropdown',
  templateUrl: './category-dropdown.component.html',
  styleUrls: ['./category-dropdown.component.scss']
})
export class CategoryDropdownComponent extends DefaultDropdownComponent implements OnInit, OnDestroy {

  @ViewChild('catFilter')
  catFilter!: CmiOsDropdownSimpleComponent;

  categories: Category[] = [];

  defaultCategories: number[] = [];

  private subscription: Subscription = Subscription.EMPTY;

  constructor(
    private filterService: FilterService,
    private surveyDataService: SurveyDataService) {
    super();
  }

  ngOnInit(): void {
    this.subscription = this.surveyDataService.reportingPeriodId$
      .subscribe((periodId: number) => {
        this.updateCategories(periodId);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  categoriesChanged(ids: any): void {
    this.defaultCategories = ids;
    this.surveyDataService.categoryIds$.next(this.defaultCategories);
  }

  public reset(): void {
    this.categoriesChanged([]);
  }

  private updateCategories(selectedReportingPeriodId: number): void {
    if (!selectedReportingPeriodId) {
      return;
    }

    this.categories = [];

    if (this.catFilter) {
      this.catFilter.toggleAll(false);
    }

    const reportingPeriod: SelectedReportingPeriod = {
      reportingPeriodId: selectedReportingPeriodId,
      surveyTypeId: this.surveyDataService.surveyTypeId$.value
    };

    this.filterService.loadCategoriesByReportingPeriod(reportingPeriod)
      .subscribe((data: Category[]) => {
        this.categories = data;
        this.categoriesChanged([]);
        this.dataLoaded();
      });
  }
}
