import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadAccess, manageHcpInsightsFunction } from '@app/core/constants/permission.settings';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsOpenSurveyQueryService } from '@cmi/os-library/services/cmi-os-open-survey-query';
import { NgxPermissionsService } from 'ngx-permissions';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sub-navbar',
  templateUrl: './sub-navbar.component.html',
  styleUrls: ['./sub-navbar.component.scss']
})
export class SubNavbarComponent implements OnInit {

  @Output() OnOpenedAudience: EventEmitter<any> = new EventEmitter();


  isOpenButtonDisabled: boolean = false;

  constructor(
    private dialog: MatDialog,
    private openDialogService: CmiOsOpenSurveyQueryService,
    private surveyService: SurveyDataService,
    private permissionService: NgxPermissionsService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.isOpenButtonDisabled = !await this.permissionService.hasPermission(`${ReadAccess}${manageHcpInsightsFunction}`);
  }

  async open() {
    const result = await this.openDialogService.openDialog(this.dialog);
    if (!result) {
      return;
    }

    this.surveyService.clearResults();

    this.surveyService.openSaveResult$.next(result);

    const query = await firstValueFrom(this.surveyService.openSurveyResults(result.insightId as number));

    this.surveyService.trackingQuery$.next(query);

    this.OnOpenedAudience.emit();
  }

  getFileName() {
    return this.surveyService.openSaveResult$.value?.name;
  }
}
