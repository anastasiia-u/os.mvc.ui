import { Component, OnInit } from '@angular/core';
import { MedicalSpecialty } from '@app/core/models/medical-specialty.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { DefaultDropdownComponent } from '../default-dropdown.component';

@Component({
  selector: 'app-specialty-dropdown',
  templateUrl: './specialty-dropdown.component.html',
  styleUrls: ['./specialty-dropdown.component.scss']
})
export class SpecialtyDropdownComponent extends DefaultDropdownComponent implements OnInit {

  medicalSpecialties: MedicalSpecialty[] = [];

  defaultMedicalSpecialties: number[] = [];

  constructor(
    private filterService: FilterService,
    private surveyDataService: SurveyDataService) {
    super()
  }

  ngOnInit(): void {
    this.filterService.loadMedicalSpecialties()
      .subscribe((data) => {
        this.medicalSpecialties = data;
      });
  }

  medicalSpecialtiesChanged(ids: any): void {
    this.surveyDataService.specialtyIds$.next(ids);
  }

  updateDefaultValues(ids: any) {
    this.defaultMedicalSpecialties = ids;
  }

  public reset(): void {
    this.updateDefaultValues([]);
    this.medicalSpecialtiesChanged([]);
  }
}
