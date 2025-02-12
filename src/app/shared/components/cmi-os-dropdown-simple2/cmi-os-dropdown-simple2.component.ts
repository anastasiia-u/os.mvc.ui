import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { CmiOsDropdownSimpleOption2 } from './cmi-os-dropdown-simple2.model';

@Component({
  selector: 'cmi-os-dropdown-simple2',
  templateUrl: './cmi-os-dropdown-simple2.component.html',
  styleUrls: ['./cmi-os-dropdown-simple2.component.scss']
})
export class CmiOsDropdownSimpleComponent2 implements OnInit {
  @Input() title = "VAR title";
  @Input() isTitleAlwaysVisible: boolean = false;
  @Input() selectPlaceholder: string = "VAR selectPlaceholder";
  @Input() searchPlaceholder: string = "";

  @Input() isUnselectAvailable: boolean = false;
  @Input() isMultipleSelect: boolean = false;
  @Input() isToShowSearch: boolean = false;
  @Input() isToShowCheckAndUncheckAll: boolean = false;

  // When Multi Select is set, but the user wants to keep the last value selected (removing the previous)
  @Input() isToKeepLastSelected: boolean = false;

  @Input() defaultValues: any[] = [];
  @Input() options: CmiOsDropdownSimpleOption2[] = [];


  // There are some cases where it's not possible to use typed array
  @Input() set dynamicOptions(value: any[]) {
    this.options = [];
    value.forEach((row, idx) => {
      this.options.push(new CmiOsDropdownSimpleOption2({
        id: row['id'] ?? idx,
        name: row['name'] ?? '',
        isDisabled: row['isDisabled'] ?? false,
        isDeleted: row['isDeleted'] ?? false,
      }));
    });

    this.resetOptionsFiltered();
  }

  @Input() dynamicTitle: boolean = true;

  @Output() onValuesChanged = new EventEmitter<string[]>();

  @ViewChild('filterInput') filterInput?: ElementRef;

  // < > MVCON-96 # https://github.com/angular/components/issues/18651
  @ViewChild(MatSelect, { static: true }) mySelect: MatSelect;
  private scrollTopBeforeSelection: number = 0;
  // </>

  _searchTerm: string = '';
  _currentOptions: CmiOsDropdownSimpleOption2[] = [];

  _selectedOptions: any[] = [];
  _selectedOptionsString: string = '';

  lastChanges: number[] = [];

  formControlSelect = new FormControl();

  constructor() { }

  ngOnInit(): void {
    // < > MVCON-96 # https://github.com/angular/components/issues/18651
    this.mySelect.openedChange.subscribe((open) => {
      if (open) {
        this.mySelect.panel.nativeElement.addEventListener(
          'scroll',
          (event: any) => (this.scrollTopBeforeSelection = event.target.scrollTop)
        );
      }
    });
    this.mySelect.optionSelectionChanges.subscribe(() => {
      if (this.mySelect && this.mySelect.panel && this.mySelect.panel.nativeElement)
        this.mySelect.panel.nativeElement.scrollTop = this.scrollTopBeforeSelection;
    });
    // </>
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.resetOptionsFiltered();

      // Update the defaults again
      if (this.defaultValues?.length > 0)
        this.updateOptionsSelected(this.defaultValues);
    }

    if (changes['defaultValues'] && changes['defaultValues'].currentValue) {
      this.updateOptionsSelected(changes['defaultValues'].currentValue);
    }
  }

  addOptionsSelected(options: any[]) {
    if (options && options.length > 0) {
      options.forEach(element => {
        if (!this._selectedOptions.includes(element))
          this._selectedOptions.push(element);
      });

      // Update info with new options
      this.formControlSelect.setValue([]);
      this.formControlSelect.setValue(this._selectedOptions);

      this.resetOptionsFiltered();
    }
  }

  updateOptionsSelected(options: any[]) {
    this.formControlSelect.setValue([]);
    if (this.isMultipleSelect) {
      this.lastChanges = JSON.parse(JSON.stringify(options));
      this.formControlSelect.setValue(options);


      // check if the option is defined as deleted,
      // if yes, disable option to avoid to be selected
      this._currentOptions.forEach(option => {
        let selectedOption = options.find(f => f.id == option.id);
        if (!selectedOption && option.isDeleted) {
          option.isDisabled = true;
        }
      });
    }
    else
      this.formControlSelect.setValue(options[0]);

    // update options selected
    this._selectedOptions = options;

    this.resetOptionsFiltered();
  }

  resetOptionsFiltered() {
    // reset filter term
    this._searchTerm = '';

    // reset options filtered by filter term
    this._currentOptions = [];
    this.options.forEach(option => {
      // If user reset all options
      // the deleted options should be disabled
      let isSelected = this._selectedOptions.findIndex(fx => fx == option.id) > -1;
      let isToDisabled = !isSelected;
      if (!isSelected) {
        isToDisabled = (option.isDisabled || option.isDeleted);
      }
      this._currentOptions.push(new CmiOsDropdownSimpleOption2({ id: option.id, name: option.name, isDisabled: isToDisabled, isDeleted: option.isDeleted }));
    });
  }

  toggleAll(check: boolean): void {
    if (this.isMultipleSelect) {
      // apply the behavior to all visible options
      this._currentOptions.forEach(opt => {
        // check all
        if (check) {
          // if not selected, add it
          // do not select disabled or deleted options
          if (!opt.isDisabled && !opt.isDeleted && this._selectedOptions.findIndex(fx => fx == opt.id) == -1)
            this._selectedOptions.push(opt.id);
        }
        // uncheck all
        else {
          // if selected, remove it
          if (this._selectedOptions.findIndex(fx => fx == opt.id) > -1) {
            this._selectedOptions = this._selectedOptions.filter(f => f != opt.id);

            // if user uncheck deleted options, disable them
            let tempOption = this._currentOptions.find(f => f.id == opt.id);
            if (tempOption && tempOption.isDeleted)
              tempOption.isDisabled = true;
          }
        }
      });
    }

    this.updateSelectTooltip();
    this.valueChange();
  }

  valueChange(): void {
    // Update dropdown control
    this.formControlSelect.setValue(this._selectedOptions);
  }

  filterItems(searchTerm: string): void {
    // reset
    this._currentOptions = [];

    // create RegEx
    let term = new RegExp(searchTerm.replace(/\*/g, '.*').toLowerCase());

    // Just filter in Options Names
    this.options.forEach(option => {
      if (searchTerm == "" || (searchTerm != "" && term.test(option.name.toLowerCase()))) {

        // check if the field is available to unckeck when user use the search
        let isSelected = this._selectedOptions.findIndex(fx => fx == option.id) > -1;
        let isToDisabled = !isSelected;
        if (!isSelected) {
          isToDisabled = (option.isDisabled || option.isDeleted);
        }
        this._currentOptions.push(new CmiOsDropdownSimpleOption2({ id: option.id, name: option.name, isDisabled: isToDisabled, isDeleted: option.isDeleted }));
      }
    });
  }

  onOptionChange(evt: any) {
    if (evt.isUserInput) {

      // Check if the single select is trying to select the already selected option
      // This behavior will unselect
      if (!this.isMultipleSelect && !this.isUnselectAvailable) {
        // avoid changing to a selected option
        if (evt.source.value == this.formControlSelect.value)
          return;
      }

      this.setOption(evt.source.selected, evt.source.value);

      this.valueChange();
    }
  }

  setOption(isToSelect: boolean, optionId: number) {
    // single select has only 1 option select
    if (!this.isMultipleSelect) {

      if (this._selectedOptions.length > 0 && this._selectedOptions.findIndex(fx => fx == optionId) > -1) {
        this._selectedOptions = [];
      }
      else {
        this._selectedOptions = [];
        this._selectedOptions.push(optionId);
      }
    }
    // multi select
    else {
      if (isToSelect) {
        if (this.isToKeepLastSelected) {
          // remove all
          this.updateOptionsSelected([]);
        }

        if (!this._selectedOptions.includes(optionId))
          this._selectedOptions.push(optionId);
      }
      else {
        this._selectedOptions.splice(this._selectedOptions.indexOf(optionId), 1);

        // check if the option is defined as deleted,
        // if yes, disable option to avoid to be selected
        let tempOption = this._currentOptions.find(f => f.id == optionId);
        if (tempOption && tempOption.isDeleted && !tempOption.isDisabled) {
          tempOption.isDisabled = true;
        }
      }
    }

    this.updateSelectTooltip();
  }

  updateSelectTooltip() {
    // Update select tooltip
    this._selectedOptionsString = '';
    this.options.forEach(option => {
      if (this._selectedOptions.findIndex(f => f == option.id) > -1) {
        this._selectedOptionsString += (this._selectedOptionsString != '' ? ', ' : '') + option.name;
      }
    });
  }

  isOpeningOptions(isOpening: boolean) {
    // add focus to input
    if (isOpening && this.isToShowSearch) {
      if (this.filterInput)
        this.filterInput.nativeElement.focus();
    }
    // Dropdown was closed, reset filter term
    else {
      if (this.isMultipleSelect) {
        const changed = this.isNewChange(this.formControlSelect.value);
        if (changed) {
          return;
        }

        this.lastChanges = JSON.parse(JSON.stringify(this.formControlSelect.value));
      }

      this.onValuesChanged.emit(this.formControlSelect.value);
      this.resetOptionsFiltered();
    }
  }

  isNewChange(ids: any): boolean {
    return (JSON.stringify(ids.sort()) === JSON.stringify(this.lastChanges.sort()));
  }
}
