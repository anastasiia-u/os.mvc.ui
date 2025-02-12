import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReportingPeriod } from '@app/core/models/reporting-period.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { Subscription } from 'rxjs';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
  selector: 'app-reporting-period-dropdown',
  templateUrl: './reporting-period-dropdown.component.html',
  styleUrls: ['./reporting-period-dropdown.component.scss']
})
export class ReportingPeriodDropdownComponent extends DefaultDropdownComponent implements OnInit {

  reportingPeriods: ReportingPeriod[] = [];

  defaultReportingPeriods: number[] = [];

  currentReportingPeriodId!: number;

  private subscription: Subscription = Subscription.EMPTY;

  @Output()
  onChanged: EventEmitter<void> = new EventEmitter();

  constructor(
    private filterService: FilterService,
    private surveyDataService: SurveyDataService) {
    super()
  }

  ngOnInit(): void {

    this.subscription = this.surveyDataService.surveyTypeId$
      .subscribe((surveyTypeId: number) => {
        this.loadReportingPeriods(surveyTypeId);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  reportingPeriodsChanged(id: any): boolean {

    if (this.currentReportingPeriodId == id) {
      return false;
    }
    this.currentReportingPeriodId = id;

    this.surveyDataService.reportingPeriodId$.next(this.currentReportingPeriodId);
    this.onChanged.emit();
    return true;
  }

  updateReportingPeriod(period: number) {
    this.defaultReportingPeriods = [period];
    return this.reportingPeriodsChanged(period);
  }

  public reset(): void {
    this.setDefaultReportingPeriod();
  }

  private loadReportingPeriods(surveyTypeId: number) {

    if (!surveyTypeId) {
      return;
    }

    this.filterService.loadReportingPeriods(surveyTypeId)
      .subscribe((data) => {
        this.reportingPeriods = data;
        this.setDefaultReportingPeriod();
        this.dataLoaded();
      });
  }

  private setDefaultReportingPeriod(): void {
    if (!this.reportingPeriods.length) {
      return;
    }

    this.currentReportingPeriodId = this.reportingPeriods[0].id;

    this.surveyDataService.defaultReportingPeriod$.next(this.reportingPeriods[0].id);

    this.defaultReportingPeriods = [this.currentReportingPeriodId];

    this.surveyDataService.reportingPeriodId$.next(this.currentReportingPeriodId);
  }
}
