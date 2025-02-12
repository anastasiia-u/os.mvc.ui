import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, UntypedFormBuilder } from "@angular/forms";
import { ViewDataType } from "@app/core/enums/view-data-type";
import { SurveyDataService } from "@app/core/services/survey-data.service";
import { SelectItem } from "@cmi/os-library/cmi-os-design-library";
import { CmiOsTableViewColumnVisibility } from "@cmi/os-library/components/cmi-os-table-view";
import { Subject } from "rxjs";
import { SortModel } from "../sort-dropdowns/sort.model";
import { ViewSelectorOption, ViewTypes } from "../view-selector/view-types";

@Component({
  selector: 'app-view-configure',
  templateUrl: './view-configure.component.html',
  styleUrls: ['./view-configure.component.scss']
})
export class ViewConfigureComponent implements OnInit, OnChanges, OnDestroy {


  // Sort Settings
  @Input() sortByOptions: SelectItem[] = [];
  @Input() sortOrderOptions: SelectItem[] = [];
  @Input() visibilityOptions: SelectItem[] = [];

  @Input() questionType: string = '';
  @Input() isAverage: boolean = false;





  @Input() viewType!: ViewTypes;
  @Input() viewDataType: ViewDataType = ViewDataType.Percentage;
  @Input() selectedCheckboxes?: any;


  @Output() OnViewModeChanged: EventEmitter<ViewTypes> = new EventEmitter();
  @Output() OnViewDataTypeChanged: EventEmitter<ViewDataType> = new EventEmitter();

  @Output() OnSortChanged: EventEmitter<SortModel> = new EventEmitter();
  @Output() OnVisibilityChanged: EventEmitter<CmiOsTableViewColumnVisibility[]> = new EventEmitter();

  public formGroup!: FormGroup;

  viewSelectorOptions: ViewSelectorOption[] = [
    { viewType: ViewTypes.BarChart, isActive: true },
    { viewType: ViewTypes.Table, isActive: false }];

  showOptions: any[] = [{ value: 'Percentages', label: 'Percentages', checked: true }, { value: 'Count', label: 'Count', checked: false }];

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private formBuilder: UntypedFormBuilder,
    private surveyDataService: SurveyDataService) {

    this.formGroup = this.formBuilder.group({
      formControlRadio: new FormControl('Percentages'),
      formControlBreakdownChart: new FormControl(false),
    });
  }

  ngOnInit(): void {
    if (this.questionType && this.questionType === 'SC') {
      this.viewSelectorOptions[0].viewType = ViewTypes.PieChart;
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewDataType']) {
      this.formGroup.get('formControlRadio')?.setValue(ViewDataType[changes['viewDataType'].currentValue]);
    }
    if (changes['viewType']) {
      const viewType = changes['viewType'].currentValue;
      if (viewType) {
        if (viewType === ViewTypes.BarChart || viewType === ViewTypes.PieChart) {
          this.viewSelectorOptions[0].viewType = viewType;
          this.viewSelectorOptions[0].isActive = true;
          this.viewSelectorOptions[1].isActive = false;
        } else if (viewType === ViewTypes.Table) {
          this.viewSelectorOptions[1].viewType = viewType;
          this.viewSelectorOptions[1].isActive = true;
          this.viewSelectorOptions[0].isActive = false;
        }
      }
    }
    if (changes['viewDataType']) {
      const viewDataType = changes['viewDataType'].currentValue;
      if (viewDataType) {
        if (viewDataType === ViewDataType.Count) {
          this.getFormControlRadio.setValue(ViewDataType.Count);
        } else if (viewDataType === ViewDataType.Percentage) {
          this.getFormControlRadio.setValue(ViewDataType.Percentage);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
  }

  get getFormControlRadio(): FormControl<any> {
    return this.formGroup.get("formControlRadio") as FormControl;
  }

  get getCheckboxPercentage(): FormControl<any> {
    return this.formGroup.get("formControlPercentageCheckbox") as FormControl;
  }

  get getCheckboxCount(): FormControl<any> {
    return this.formGroup.get("formControlCountCheckbox") as FormControl;
  }

  onViewModeChangedHandler(viewMode: ViewTypes) {
    this.OnViewModeChanged.emit(viewMode);
  }

  onViewDataTypeChanged(viewDataTypeValue: string) {
    const viewDataType = viewDataTypeValue == 'Count' ? ViewDataType.Count : ViewDataType.Percentage;

    this.showOptions.forEach(opt => {
      opt.checked = (opt.value == viewDataTypeValue);
    });

    // Remove focus
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 15);

    this.OnViewDataTypeChanged.emit(viewDataType);
  }
  onSortOptionsChanged(sortOptions: any) {
    this.OnSortChanged.emit(sortOptions);
  }
  onVisibilityOptionsChanged(visibilityOptions: any) {
    this.OnVisibilityChanged.emit(visibilityOptions);
  }
}
