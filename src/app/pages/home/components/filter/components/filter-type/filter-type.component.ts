import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadAccess, amaSelectionFunction, cmiSelectionFunction, npiSelectionFunction, targetListSelectionFunction } from '@app/core/constants/permission.settings';
import { FilterTypeEnum } from '@app/core/enums/filter-type.enum';
import { HcpTargetListResult } from '@app/core/models/hcp-target-list-result.model';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { CmiOsFilterTypeButton } from '@cmi/os-library/components/cmi-os-filter-type';
import { NgxPermissionsService } from 'ngx-permissions';
import { DefaultDropdownComponent } from '../default-dropdown.component';
import { FilterConstant } from './filter-constant';
import { FilterDialogService } from './filter-dialog.service';

@Component({
  selector: 'app-filter-type',
  templateUrl: './filter-type.component.html',
  styleUrls: ['./filter-type.component.scss']
})

export class FilterTypeComponent extends DefaultDropdownComponent implements OnInit {
  public titleText = 'Filter Type';

  public filterTypeTooltipText = this.getFilterTypeTooltipText(FilterConstant.PANEL_OPTION);

  public specialtyTypeTooltipText = 'AMA, NPI, or CMI enables the user to select specific specialties';

  previousItemSelected: number = FilterConstant.PANEL_OPTION;

  public hcpResult: HcpTargetListResult | null = null;

  public filterTypeButtons: CmiOsFilterTypeButton[] = [];

  constructor(
    private dialog: MatDialog,
    private filterDialogService: FilterDialogService,
    private filterService: FilterService,
    public surveyDataService: SurveyDataService,
    private permissionService: NgxPermissionsService
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.filterTypeButtons = [];

    this.filterTypeButtons.push({ id: FilterConstant.PANEL_OPTION, name: "Responders", isActive: true });

    const isTargetListAccess = await this.permissionService.hasPermission(`${ReadAccess}${targetListSelectionFunction}`);
    const isNPIAccess = await this.permissionService.hasPermission(`${ReadAccess}${npiSelectionFunction}`);
    const isAMAAccess = await this.permissionService.hasPermission(`${ReadAccess}${amaSelectionFunction}`);
    const isCMIAccess = await this.permissionService.hasPermission(`${ReadAccess}${cmiSelectionFunction}`);
    const displayFilters = !this.surveyDataService.isCorporateSurveyType() && !this.surveyDataService.isConsumerSurveyType() && !this.surveyDataService.isGlobalProfessionalSurveyType() && !this.surveyDataService.isPayerSurveyType();

    if (isTargetListAccess && displayFilters) {
      this.filterTypeButtons.push({ id: FilterConstant.HCP_OPTION, name: "Target List", isActive: false });
    }

    if (displayFilters && (isAMAAccess || isNPIAccess || isCMIAccess)) {
      this.filterTypeButtons.push({ id: -1, name: '', isActive: false, isContent: true });
    }

    if (isAMAAccess && displayFilters) {
      this.filterTypeButtons.push({ id: FilterConstant.AMA_OPTION, name: "AMA", isActive: false });
    }

    if (isNPIAccess && displayFilters) {
      this.filterTypeButtons.push({ id: FilterConstant.NPI_OPTION, name: "NPI", isActive: false });
    }

    if (isCMIAccess && displayFilters) {
      this.filterTypeButtons.push({ id: FilterConstant.EMPOWER_OPTION, name: "CMI", isActive: false });
    }
  }

  public async filterTypeChanged(filterOption: number, autoSelect: boolean = false): Promise<void> {
    this.resetDisplayData();
    this.surveyDataService.filterType$.next(filterOption);

    if (filterOption !== FilterConstant.HCP_OPTION) {
      this.previousItemSelected = filterOption;
      this.surveyDataService.hcpTargetList$.next(null);
      this.filterDialogService.reset();
    }

    if (filterOption == FilterConstant.HCP_OPTION && !autoSelect) {
      this.hcpResult = await this.filterDialogService.openDialog(this.dialog);
      if (this.hcpResult) {
        this.surveyDataService.hcpTargetList$.next(this.hcpResult);
      } else {
        if (!this.surveyDataService.hcpTargetList$.value?.collection) {
          this.autoSetFilterType(this.previousItemSelected);
        }
        return;
      }
    }

    const filterType = this.getFilterType(filterOption);

    if (filterType) {
      const result = await this.filterService.getFilterTypeCount(filterType);

      this.updateHCPResult(result, FilterTypeEnum[filterType]);
    }

    this.filterTypeTooltipText = this.getFilterTypeTooltipText(filterOption);
  }

  private getFilterType(filterOption: number): FilterTypeEnum | null {
    switch (filterOption) {
      case FilterConstant.AMA_OPTION:
        return FilterTypeEnum.AMA;
      case FilterConstant.NPI_OPTION:
        return FilterTypeEnum.NPI;
      case FilterConstant.EMPOWER_OPTION:
        return FilterTypeEnum.CMI;
      default: return null;
    }
  }

  private updateHCPResult(count: number, name: string) {
    this.hcpResult = new HcpTargetListResult();
    this.hcpResult.count = count;
    this.hcpResult.name = name;
    this.surveyDataService.hcpTargetList$.next(this.hcpResult);
  }

  public reset(): void {
    this.surveyDataService.hcpTargetList$.next(null);

    this.filterTypeButtons.map(x => x.isActive = false);

    this.filterTypeButtons[0].isActive = true;

    this.filterDialogService.reset();

    this.resetDisplayData();

    this.surveyDataService.filterType$.next(0);

    this.filterTypeTooltipText = this.getFilterTypeTooltipText(FilterConstant.PANEL_OPTION);

    this.previousItemSelected = FilterConstant.PANEL_OPTION;
  }

  public autoSetFilterType(filterOption: number) {
    const item = this.filterTypeButtons.find(x => x.id == filterOption);
    if (item) {
      this.filterTypeButtons.map(x => x.isActive = false);
      item.isActive = true;
      this.filterTypeChanged(filterOption, true);
    }
  }

  private resetDisplayData(): void {
    this.hcpResult = null;
  }

  private getFilterTypeTooltipText(filterOption: number) {

    const panel = this.surveyDataService.isProfessionalSurveyType()
      ? 'Panel is the full survey group of HCPs (2,400-2,600 across all included specialties)'
      : 'Panel is the full group of consumers.';

    switch (filterOption) {
      case FilterConstant.PANEL_OPTION:
        return panel
      case FilterConstant.HCP_OPTION:
        return 'Target List enables the user to select on a specific brand HCP list';
      default: return panel;
    }
  }
}
