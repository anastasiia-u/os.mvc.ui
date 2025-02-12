import { CmiOsDropdownGroupOption } from "@cmi/os-library/components/cmi-os-dropdown-group";

export class Question extends CmiOsDropdownGroupOption {

}

export class SelectedQuestion {
    surveyTypeId!: number;
    questionIds!: number[];
}