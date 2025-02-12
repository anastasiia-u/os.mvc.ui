export interface Client {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface TargetList {
  id: number;
  brandId: number;
  companyId: number;
  importFileName: string;
  collection: string;
  hcpCount: number;
}

export interface TargetListSearch extends TargetList {
  brandName: string;
  companyName: string;
}

export class Campaign {
  id: number;
  name: string;
  data?: object;

  constructor(item?: Campaign) {
    this.id = item && item.id || 0;
    this.name = item && item.name || '';
  }
}

export interface Insights {
  id: number;
  name: string;
}

export interface SearchInsights extends Insights {
  brandId: number;
  campaignId: number;
  companyId: number;
}

export interface FilterTypeCount {
  count: number;
}