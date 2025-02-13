import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterActionsComponent } from './filter-actions.component';
import { MatDialog } from '@angular/material/dialog';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsSaveSurveyQueryService } from '@cmi/os-library/services/cmi-os-save-survey-query';
import { NgxPermissionsService } from 'ngx-permissions';
import { BehaviorSubject, of } from 'rxjs';

describe('FilterActionsComponent', () => {
  let component: FilterActionsComponent;
  let fixture: ComponentFixture<FilterActionsComponent>;
  let surveyDataServiceMock: jasmine.SpyObj<SurveyDataService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let saveDialogServiceMock: jasmine.SpyObj<CmiOsSaveSurveyQueryService>;
  let permissionServiceMock: jasmine.SpyObj<NgxPermissionsService>;

  beforeEach(async () => {
    surveyDataServiceMock = jasmine.createSpyObj('SurveyDataService', ['loadData', 'saveSurveyResults'], {
      surveyTypeId$: new BehaviorSubject(null),
      defaultSurveyType$: new BehaviorSubject(null),
      reportingPeriodId$: new BehaviorSubject(null),
      defaultReportingPeriod$: new BehaviorSubject(null),
      specialtyIds$: new BehaviorSubject([]),
      categoryIds$: new BehaviorSubject([]),
      questionIds$: new BehaviorSubject([]),
      subQuestionResponseIds$: new BehaviorSubject([]),
      hcpTargetList$: new BehaviorSubject(null),
      openSaveResult$: new BehaviorSubject(null)
    });

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    saveDialogServiceMock = jasmine.createSpyObj('CmiOsSaveSurveyQueryService', ['openDialog']);
    permissionServiceMock = jasmine.createSpyObj('NgxPermissionsService', ['hasPermission']);

    await TestBed.configureTestingModule({
      declarations: [ FilterActionsComponent ],
      providers: [
        { provide: SurveyDataService, useValue: surveyDataServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: CmiOsSaveSurveyQueryService, useValue: saveDialogServiceMock },
        { provide: NgxPermissionsService, useValue: permissionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterActionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isSaveButtonDisabled based on permissions', async () => {
    permissionServiceMock.hasPermission.and.returnValue(Promise.resolve(true));
    await component.ngOnInit();
    expect(component.isSaveButtonDisabled).toBeFalse();

    permissionServiceMock.hasPermission.and.returnValue(Promise.resolve(false));
    await component.ngOnInit();
    expect(component.isSaveButtonDisabled).toBeTrue();
  });

  it('should check if reset button is disabled', () => {
    expect(component.isResetButtonDisabled).toBeTrue();

    surveyDataServiceMock.surveyTypeId$.next(1);
    surveyDataServiceMock.defaultSurveyType$.next(1);
    expect(component.isResetButtonDisabled).toBeFalse();
  });

  it('should check if see results is disabled', () => {
    expect(component.isSeeResultsDisabled).toBeTrue();

    surveyDataServiceMock.categoryIds$.next([1]);
    surveyDataServiceMock.questionIds$.next([1]);
    surveyDataServiceMock.subQuestionResponseIds$.next([1]);
    expect(component.isSeeResultsDisabled).toBeFalse();

    surveyDataServiceMock.hcpTargetList$.next({
      collection: "", count: 0, get displayCount(): string {
        return "";
      }, get displayName(): string {
        return "";
      }, name: "", inactive: true });
    expect(component.isSeeResultsDisabled).toBeTrue();
  });

  it('should load survey results', () => {
    spyOn(component.seeResult, 'emit');
    component.loadSurveyResults();
    expect(component.seeResult.emit).toHaveBeenCalled();
    expect(surveyDataServiceMock.loadData).toHaveBeenCalled();
  });

  it('should reset filter', () => {
    spyOn(component.resetControls, 'emit');
    component.resetFilter();
    expect(component.resetControls.emit).toHaveBeenCalled();
  });

  it('should save survey results', () => {
    const mockResult = {
      name: 'Test Query',
      clientId: 52,
      brandId: 2,
      campaignId: 1,
      insightId: 53
    };
    saveDialogServiceMock.openDialog.and.returnValue(of(mockResult));
    surveyDataServiceMock.saveSurveyResults.and.returnValue(of(404));

    component.save();

    expect(saveDialogServiceMock.openDialog).toHaveBeenCalled();
    expect(surveyDataServiceMock.openSaveResult$.value).toEqual(mockResult);
    expect(surveyDataServiceMock.saveSurveyResults).toHaveBeenCalledWith(mockResult);
  });

  it('should not save when dialog is cancelled', () => {
    saveDialogServiceMock.openDialog.and.returnValue(of(null));

    component.save();

    expect(saveDialogServiceMock.openDialog).toHaveBeenCalled();
    expect(surveyDataServiceMock.saveSurveyResults).not.toHaveBeenCalled();
  });
});