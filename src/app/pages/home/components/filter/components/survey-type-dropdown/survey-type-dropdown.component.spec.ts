import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTypeDropdownComponent } from './survey-type-dropdown.component';

describe('SurveyTypeDropdownComponent', () => {
  let component: SurveyTypeDropdownComponent;
  let fixture: ComponentFixture<SurveyTypeDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyTypeDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyTypeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
