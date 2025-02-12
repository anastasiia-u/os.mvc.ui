
export class CmiOsDropdownSimpleOption2 {

  id: any;
  name: string;

  isDisabled: boolean;
  isDeleted: boolean;

  constructor(item?: CmiOsDropdownSimpleOption2) {
    this.id = item && item.id || 0;
    this.name = item && item.name || '';

    this.isDisabled = item && item.isDisabled || false;
    this.isDeleted = item && item.isDeleted || false;
  }

}



