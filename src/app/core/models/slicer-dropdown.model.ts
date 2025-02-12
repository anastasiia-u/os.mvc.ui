import { FormGroup } from "@angular/forms";
import { SelectItem } from "@cmi/os-library/cmi-os-design-library";

export interface SlicerDropdown {
    type: string | number,
    title: string,
    size: string,
    form: FormGroup,
    options: SelectItem[]
}