import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, UntypedFormBuilder } from "@angular/forms";
import { SelectItem } from "@cmi/os-library/cmi-os-design-library";
import { CmiOsTableViewColumnVisibility } from "@cmi/os-library/components/cmi-os-table-view";
import { Subject, takeUntil } from "rxjs";
import { SortDirection, SortModel } from "./sort.model";

@Component({
  selector: 'app-sort-dropdowns',
  templateUrl: './sort-dropdowns.component.html',
  styleUrls: ['./sort-dropdowns.component.scss']
})
export class SortDropdownsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sortByOptions: SelectItem[] = [];
  @Input() sortOrderOptions: SelectItem[] = [];
  @Input() visibilityOptions: SelectItem[] = [];

  @Input() sortOptions?: SortModel;
  @Input() selectedCheckboxes?: any;

  @Output() OnSortChanged: EventEmitter<SortModel> = new EventEmitter();
  @Output() OnVisibilityChanged: EventEmitter<CmiOsTableViewColumnVisibility[]> = new EventEmitter();

  formGroup!: FormGroup;

  _currentVisibilityOptions: SelectItem[] = [];
  sortIcon = { isMatIcon: true, icon: 'sort' };
  visibilityIcon = { isMatIcon: true, icon: 'tune' };

  destroyed$: Subject<boolean> = new Subject();

  constructor(private formBuilder: UntypedFormBuilder) {
    this.formGroup = formBuilder.group({
      sortBy: new FormControl(),
      sortDirection: new FormControl(),
      visibility: new FormControl([]),
    });
  }

  ngOnInit() {
    let skipDisable = false;

    if (this.sortOptions) {
      if (this.sortOptions.sortColumnName) {
        const sortByValue = this.sortByOptions.find(x => x.name == this.sortOptions?.sortColumnName)?.value;
        if (sortByValue) {
          skipDisable = true;
          this.formGroup.get('sortBy')?.setValue(sortByValue);
          this.formGroup.get('sortDirection')?.setValue(this.sortOptions.isAscending ? SortDirection.Ascending : SortDirection.Descending)
        }
      }
    }

    if (this._currentVisibilityOptions.length == 0) {
      this._currentVisibilityOptions = JSON.parse(JSON.stringify(this.visibilityOptions));
    }


    if (this.selectedCheckboxes) {
      const columns = Object.getOwnPropertyNames(this.selectedCheckboxes);

      if (columns.length) {
        const idsSelected: any[] = [];
        columns.forEach(c => {
          if (!this.selectedCheckboxes[c]) {
            const foundColumn = this.visibilityOptions.find(v => v.name == c);
            if (foundColumn) {
              idsSelected.push(foundColumn.value);
            }
          }
        })

        this.formGroup.get('visibility')?.setValue(idsSelected);
      }
    }

    this.formGroup.get('sortBy')?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        if (this.formGroup.get("sortBy")?.value) {
          this.formGroup.get("sortDirection")?.enable();
        };
      });

    this.formGroup.get('sortDirection')?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        this.onSortChanged()
      });

    this.formGroup.get('visibility')?.setValue(this.visibilityOptions.map(x => x.value));

    this.formGroup.get('visibility')?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(x => {
        console.log("Values changed!!", x);
        this.onVisibilityChanged()
      });

    if (!skipDisable)
      this.formGroup.get("sortDirection")?.disable();
  }
  ngOnChanges(changes: SimpleChanges): void {

    if (changes['sortByOptions']) {
      //this.onSortChanged();
      // Reset direction
      const columnValue = this.sortByOptions.find(x => x.value == this.formGroup.get("sortBy")?.value)?.value;
      const directionValue = this.formGroup.get("sortDirection")?.value;
      if (!columnValue)
        this.resetSort();
    }
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
  }

  onSortChanged() {
    const columnValue = this.sortByOptions.find(x => x.value == this.formGroup.get("sortBy")?.value)?.value;
    const columnName = this.sortByOptions.find(x => x.value == this.formGroup.get("sortBy")?.value)?.name;
    let direction: SortDirection = this.formGroup.get("sortDirection")?.value;

    if (columnName) {
      // Define a default value
      if (!direction) {
        this.formGroup.get('sortDirection')?.setValue(SortDirection.Ascending, { emitEvent: false });
        this.formGroup.get('sortDirection')?.enable({ emitEvent: false });
        direction = SortDirection.Ascending;
      }

      const sortModel = {
        sortColumnValue: columnValue,
        sortColumnName: columnName,
        isAscending: direction == SortDirection.Ascending
      };

      this.OnSortChanged.emit(sortModel);
    }
  }

  resetSort() {
    this.formGroup.get("sortBy")?.setValue('', { emitEvent: false });
    this.formGroup.get("sortDirection")?.setValue('', { emitEvent: false });
    this.formGroup.get("sortDirection")?.disable({ emitEvent: false });

    const sortModel = {
      sortColumnValue: '',
      sortColumnName: '',
      isAscending: true //SortDirection.Ascending
    };

    this.OnSortChanged.emit(sortModel);
  }

  onVisibilityChanged() {
    const selected: any[] = this.formGroup.get('visibility')?.value;

    if (!selected)
      return;

    const options: CmiOsTableViewColumnVisibility[] = this.visibilityOptions.map(x => {
      const isSelected = selected.some(s => s === x.value);

      return {
        name: x.name,
        value: x.value,
        isHidden: !isSelected
      }
    });

    this.OnVisibilityChanged.emit(options);
  }
}
