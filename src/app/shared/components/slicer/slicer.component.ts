import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ChartFilterType } from '@app/core/enums/chart-filter-type.enum';
import { ChartFiltersData } from '@app/core/models/chart-fillters-data';
import { MedicalSpecialty } from '@app/core/models/medical-specialty.model';
import { SlicerDropdown } from '@app/core/models/slicer-dropdown.model';
import { IChartFilterBreakdown } from '@app/core/models/surveyChartFilterBreakdown';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { ButtonType, SelectItem } from '@cmi/os-library/cmi-os-design-library';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-slicer',
  templateUrl: './slicer.component.html',
  styleUrls: ['./slicer.component.scss']
})
export class SlicerComponent implements OnInit, OnChanges {

  @Input() data: ChartFiltersData[] = [];
  @Input() sectionId: number;
  @Input() categoryId: number;
  @Input() questionId: number;
  @Input() answerIds: number[];

  // @Output() onFilterChanged: EventEmitter<IChartFilterResults[]> = new EventEmitter();
  @Output() OnFilterChanged: EventEmitter<IChartFilterBreakdown> = new EventEmitter();


  medicalSpecialties: MedicalSpecialty[] = [];

  specialtyDropdown!: SlicerDropdown;

  basedOnDropdown!: SlicerDropdown;

  isConsumer: boolean = false;

  canReset: boolean = false;

  buttonTypeEnum = ButtonType;

  protected slicerForm: UntypedFormGroup;
  protected secondaryForm: UntypedFormGroup;

  protected dropdowns = [] as any[];

  private readonly basedOnKey = "basedOn";

  _currentBreakdownOption = 0;


  constructor(private formBuilder: UntypedFormBuilder,
    private surverService: SurveyDataService) {
    this.slicerForm = this.formBuilder.group({});
    this.secondaryForm = this.formBuilder.group({
      formControlBreakdownChart: new FormControl(false)
    });
  }

  ngOnInit() {
    this.isConsumer = this.surverService.isConsumerSurveyType();
  }

  ngOnChanges() {
    if (!this.data.length) {
      this.dropdowns = [];
      return;
    }

    this.data = this.data = this.data.sort((a, b) => {
      if (a.name.toLocaleLowerCase() === 'specialty') return -1;
      if (b.name.toLocaleLowerCase() === 'specialty') return 1;
      return 0;
    });

    if (this.data[0].name.toLocaleLowerCase() === 'specialty') {
      this.data[0].name = 'CMI Specialty';
    }

    this.dropdowns = this.generateDropdowns();

    this.subscribeOnvalueChanges();
  }

  onReset() {
    this.basedOnDropdown.form.get('normal')?.setValue([]);
    this.dropdowns.forEach(d => d.form.get('normal')?.setValue([]));
  }



  private subscribeOnvalueChanges() {
    this.slicerForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(x => {

        const filterBreakdown: IChartFilterBreakdown = {
          sectionId: this.sectionId,
          categoryId: this.categoryId,
          questionId: this.questionId,
          answerIds: this.answerIds,
          breakdownType: this._currentBreakdownOption,

          filters: []
        };

        let totalLengthSelected = this.dropdowns.reduce((acc, val) => {
          acc += val.form.get('normal').value.length;
          return acc;
        }, 0);

        if (totalLengthSelected > 0) this.canReset = true;
        else this.canReset = false;

        this.dropdowns.forEach(item => filterBreakdown.filters.push({ key: item.type, values: x[ChartFilterType[item.type]] }));

        this.OnFilterChanged.emit(filterBreakdown);
      });
  }

  private generateDropdowns() {

    this.slicerForm = this.formBuilder.group({});

    let dropdowns: any[] = [];
    const basedOnOptions: SelectItem[] = [];

    this.data.forEach(item => {
      const form = this.generateForm();

      basedOnOptions.push({ value: item.key, name: item.name });
      dropdowns.push({ type: item.key, title: item.name, size: 'lg', form: form, options: item.values.map(x => { return { value: x.id, name: x.name } as SelectItem; }) ?? [] });

      this.slicerForm.setControl(ChartFilterType[item.key], form.get('normal'));
    });

    const formBasedOn = this.generateForm();

    this.basedOnDropdown = {
      type: this.basedOnKey, title: 'Based On', size: 'lg', form: formBasedOn,
      options: basedOnOptions
    };

    this.secondaryForm.setControl(this.basedOnKey, formBasedOn.get('normal'));

    return dropdowns;
  }

  private generateForm(normalValue?: string | string[], disabledValue?: string | string[]) {
    const form = new FormGroup({
      normal: new FormControl(normalValue ?? []),
      disabled: new FormControl(disabledValue ?? [])
    });

    form.controls.disabled.disable();

    return form;
  }
}

