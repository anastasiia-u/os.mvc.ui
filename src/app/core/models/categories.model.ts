import { CmiOsDropdownSimpleOption } from "@cmi/os-library/components/cmi-os-dropdown-simple";

export class Category extends CmiOsDropdownSimpleOption {

}

export class SelectedCategory {
    surveyTypeId!: number;
    reportingPeriodId!: number;
    categoryIds!: number[];
}