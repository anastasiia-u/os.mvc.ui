import { CmiOsDropdownSimpleOption } from "@cmi/os-library/components/cmi-os-dropdown-simple";
import { ChartFilterType } from "../enums/chart-filter-type.enum";

export interface ChartFiltersData {
    key: ChartFilterType,
    name: string,
    values: CmiOsDropdownSimpleOption[]
}