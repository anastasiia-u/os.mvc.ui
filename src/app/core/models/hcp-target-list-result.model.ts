export class HcpTargetListResult {
  collection: string = '';
  name: string = '';
  count: number = 0;
  inactive: boolean = false;

  get displayCount(): string {
    const countText = this.count.toLocaleString();
    return `${countText} </br> HCPs`
  }

  get displayName(): string {
    if (this.collection && this.name) {
      return `[${this.collection}] ${this.name}`
    }

    if (this.name) {
      return this.name;
    }

    return '';
  }
}
