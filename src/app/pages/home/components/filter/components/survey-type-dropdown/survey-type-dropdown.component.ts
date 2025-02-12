import { Component, OnInit } from '@angular/core';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsDropdownSimpleOption } from '@cmi/os-library/components/cmi-os-dropdown-simple';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
  selector: 'app-survey-type-dropdown',
  templateUrl: './survey-type-dropdown.component.html',
  styleUrls: ['./survey-type-dropdown.component.scss']
})
export class SurveyTypeDropdownComponent extends DefaultDropdownComponent implements OnInit {

  surveyTypes: CmiOsDropdownSimpleOption[] = [];

  defaultSurveyTypes: number[] = [];

  currentSurveyTypeId!: number;

  constructor(
    private filterService: FilterService,
    private surveyDataService: SurveyDataService) {
    super()
  }

  ngOnInit(): void {
    this.filterService.loadSurveyTypes()
      .subscribe((data) => {
        this.surveyTypes = data;
        this.setDefaultSurveyType();
        this.dataLoaded();
      });
  }

  surveyTypeChanged(id: any): boolean {

    if (this.currentSurveyTypeId == id) {
      return false;
    }

    this.currentSurveyTypeId = id;

    this.surveyDataService.surveyTypeId$.next(this.currentSurveyTypeId);

    return true;
  }

  updateSurveyType(surveyType: number) {
    this.defaultSurveyTypes = [surveyType];
    return this.surveyTypeChanged(surveyType);
  }

  public reset(): void {
    this.setDefaultSurveyType();
  }


  private setDefaultSurveyType(): void {
    if (!this.surveyTypes.length) {
      return;
    }

    this.currentSurveyTypeId = this.surveyTypes[0].id;

    this.surveyDataService.defaultSurveyType$.next(this.surveyTypes[0].id);

    this.defaultSurveyTypes = [this.currentSurveyTypeId];

    this.surveyDataService.surveyTypeId$.next(this.currentSurveyTypeId);
  }

}
