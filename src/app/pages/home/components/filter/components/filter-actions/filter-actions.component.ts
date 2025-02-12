import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WriteAccess, manageHcpInsightsFunction } from '@app/core/constants/permission.settings';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { ButtonType } from '@cmi/os-library/cmi-os-design-library';
import { CmiOsSaveSurveyQueryModel, CmiOsSaveSurveyQueryService } from '@cmi/os-library/services/cmi-os-save-survey-query';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-filter-actions',
  templateUrl: './filter-actions.component.html',
  styleUrls: ['./filter-actions.component.scss']
})
export class FilterActionsComponent implements OnInit {

  @Output()
  resetControls: EventEmitter<void> = new EventEmitter();

  @Output()
  seeResult: EventEmitter<void> = new EventEmitter();

  isSaveButtonDisabled: boolean = false;
  buttonTypeEnum = ButtonType;

  constructor(
    public surveyDataService: SurveyDataService,
    private dialog: MatDialog,
    private saveDialogService: CmiOsSaveSurveyQueryService,
    private permissionService: NgxPermissionsService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.isSaveButtonDisabled = !await this.permissionService.hasPermission(`${WriteAccess}${manageHcpInsightsFunction}`);
  }

  get isResetButtonDisabled(): boolean {
    return !(
      (this.surveyDataService.surveyTypeId$.value !== this.surveyDataService.defaultSurveyType$.value)
      || (this.surveyDataService.reportingPeriodId$.value !== this.surveyDataService.defaultReportingPeriod$.value)
      || this.surveyDataService.specialtyIds$.value.length
      || this.surveyDataService.categoryIds$.value.length
      || this.surveyDataService.questionIds$.value.length
      || this.surveyDataService.subQuestionResponseIds$.value.length
      || this.surveyDataService.hcpTargetList$.value
    );
  }

  get isSeeResultsDisabled(): boolean {
    return !(this.surveyDataService.categoryIds$.value.length
      && this.surveyDataService.questionIds$.value.length
      && this.surveyDataService.subQuestionResponseIds$.value.length)
      || this.isInactiveTargetList;
  }

  get isInactiveTargetList(): boolean {
    return !!this.surveyDataService.hcpTargetList$.value && this.surveyDataService.hcpTargetList$.value.inactive;
  }

  loadSurveyResults() {
    this.seeResult.emit();
    this.surveyDataService.loadData();
  }

  resetFilter() {
    this.resetControls.emit();
  }

  save() {
    this.saveDialogService.openDialog(this.dialog)
      .subscribe((result: CmiOsSaveSurveyQueryModel | null) => {
        if (!result) {
          return;
        }

        this.surveyDataService.openSaveResult$.next(result);

        this.surveyDataService.saveSurveyResults(result).subscribe();
      });
  }
}
