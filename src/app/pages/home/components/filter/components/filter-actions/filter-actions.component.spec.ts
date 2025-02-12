import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CmiOsSaveSurveyQueryModule } from '@cmi/os-library/services/cmi-os-save-survey-query';

import { FilterActionsComponent } from './filter-actions.component';
import { TrackingQueryService } from './tracking-query.service';

describe('FilterActionsComponent', () => {
  let component: FilterActionsComponent;
  let fixture: ComponentFixture<FilterActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterActionsComponent],
      imports: [HttpClientTestingModule, MatDialogModule, CmiOsSaveSurveyQueryModule],
      providers: [{
        provide: 'TrackingQueryService',
        useClass: TrackingQueryService
      }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilterActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
