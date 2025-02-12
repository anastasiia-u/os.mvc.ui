import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { HcpTargetListResult } from "@app/core/models/hcp-target-list-result.model";
import { CmiOsClientBrandListItem, CmiOsClientBrandSection, CmiOsFilterTypeDialogComponent, CmiOsFilterTypeDialogData } from '@cmi/os-library/components/cmi-os-filter-type-dialog';
import { asyncScheduler, debounceTime, firstValueFrom, map, Observable, Subject, throttleTime } from "rxjs";
import { Brand, Client, TargetList, TargetListSearch } from "src/app/core/models/filter-type";
import { EmpowerService } from 'src/app/core/services/empower.service';

@Injectable({
  providedIn: 'root'
})
export class FilterDialogService {
  private clientBrandData!: CmiOsFilterTypeDialogData;
  private selectedClientId!: number;
  private count: number = 0;
  private readonly clientSelected$: Subject<CmiOsClientBrandListItem> = new Subject();
  private readonly brandSelected$: Subject<CmiOsClientBrandListItem> = new Subject();
  private readonly searchTerm$: Subject<string> = new Subject();

  private readonly clientColumn: number = 1;
  private readonly brandColumn: number = 2;
  private readonly targetListColumn: number = 3;
  private readonly hcpMaxColumns: number = 4;

  private selectedClient?: CmiOsClientBrandListItem;
  private selectedBrand?: CmiOsClientBrandListItem;
  private selectedTargetList?: CmiOsClientBrandListItem;

  private readonly ClientSection = "Client";
  private readonly BrandSection = "Brand";
  private readonly TargetListSection = "Target List";

  private previousSearchTerm: string = '';

  constructor(
    private empowerService: EmpowerService,
    @Inject(DOCUMENT) private document: Document) {

    this.clientSelected$.pipe(throttleTime(1500, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(async (item: CmiOsClientBrandListItem) => {
        await this.onClientSelected(item);
      });

    this.brandSelected$.pipe(throttleTime(1500, asyncScheduler, { leading: true, trailing: true }))
      .subscribe(async (item: CmiOsClientBrandListItem) => {
        await this.onBrandSelected(item);
      });

    this.searchTerm$.pipe(debounceTime(1000))
      .subscribe(async (searchTerm: string) => {
        if (searchTerm == this.previousSearchTerm) {
          return;
        }

        this.previousSearchTerm = searchTerm;
        if (searchTerm === '') {
          const clients = await this.empowerService.getClients();
          this.initSectionsData(clients);
          return;
        }
        await this.searchTargetLists(searchTerm);
      });
  }

  public async openDialog(dialog: MatDialog): Promise<HcpTargetListResult | null> {

    const clients = await this.empowerService.getClients();

    this.initDialogData(clients);

    if (this.selectedTargetList) {
      await this.preselectData();
    }

    return firstValueFrom(this.openAndMapResult(dialog));
  }

  public reset() {
    this.selectedTargetList = undefined;
  }

  private async preselectData() {

    const c = this.clientBrandData.sections.find(x => x.name == this.ClientSection)?.items?.find((x: any) => x.id == this.selectedTargetList?.data.companyId) as CmiOsClientBrandListItem;

    c.isSelected = true;

    await this.onClientSelected(c);

    const b = this.clientBrandData.sections.find(x => x.name == this.BrandSection)?.items?.find((x: any) => x.id == this.selectedTargetList?.data.brandId) as CmiOsClientBrandListItem;

    b.isSelected = true;

    await this.onBrandSelected(b);

    const t = this.clientBrandData.sections.find(x => x.name == this.TargetListSection)?.items?.find((x: any) => x.name == this.selectedTargetList?.name) as CmiOsClientBrandListItem;

    t.isSelected = true;

    this.onTargetListSelected(t);

    this.document.querySelectorAll('.regular-section mat-list-option.selected-option').forEach(e => e.scrollIntoView());

  }

  private get isSearchMode(): boolean {
    return this.clientBrandData?.sections[0]?.isTarget ?? false;
  }

  private initDialogData(clients: any[]): void {
    this.clientBrandData = {
      columns: this.hcpMaxColumns,
      width: 1200,
      height: 400,
      rowHeight: 300,
      searchLabel: 'Target List Search',
      title: 'Target List',
      actionButtonDisabled: () => this.isButtonDisabled(),
      searchTermChanged: (searchTerm: string) => this.searchTerm$.next(searchTerm),
      sections: []
    };
    this.initSectionsData(clients);
  }

  private isButtonDisabled(): boolean {
    return !this.clientBrandData.sections.some(s => s.isFinal);
  }

  private initSectionsData(clients: any[]): void {
    this.clientBrandData.sections = [{
      name: this.ClientSection,
      colSpan: this.hcpMaxColumns,
      itemSelected: (item: CmiOsClientBrandListItem) => this.onClientSelected(item),
      items: clients.map((client: Client) => ({
        id: client.id,
        name: client.name
      }))
    }];
    this.clientBrandData.breadcrumbs = [];
  }

  private openAndMapResult(dialog: MatDialog): Observable<HcpTargetListResult | null> {
    return CmiOsFilterTypeDialogComponent.openDialog(dialog, this.clientBrandData)
      .pipe(map(actionClicked => actionClicked ? this.getDialogResult() : this.getCancelResult()));
  }

  private getDialogResult() {
    const item = this.clientBrandData.sections.
      find((s: CmiOsClientBrandSection) => s.isTarget)?.items?.
      find((i: CmiOsClientBrandListItem) => i.isSelected);

    if (!item) {
      return null;
    }

    this.selectedTargetList = item;

    const result = new HcpTargetListResult();

    result.name = item.data.importFileName;
    result.collection = item.data.collection;
    result.count = item.data.hcpCount;

    return result;
  }

  private getCancelResult() {
    if (!this.selectedTargetList) {
      this.reset();
    }
    return null;
  }

  private async onClientSelected(clientItem: CmiOsClientBrandListItem) {
    this.selectedClient = clientItem;
    this.clientBrandData.breadcrumbs = [];
    this.selectedClientId = clientItem.id;
    this.clientBrandData.sections.length = this.clientColumn;
    const brands: Brand[] = await this.empowerService.getBrands(clientItem.id);
    const brandSection: CmiOsClientBrandSection = {
      name: this.BrandSection,
      itemSelected: (item: CmiOsClientBrandListItem) => this.brandSelected$.next(item),
      items: brands.map((brand: Brand) => ({
        id: brand.id,
        name: brand.name
      }))
    };
    this.appendSection(brandSection);
  }

  private async onBrandSelected(brandItem: CmiOsClientBrandListItem) {
    this.selectedBrand = brandItem;
    this.clientBrandData.breadcrumbs = [];
    this.clientBrandData.sections.length = this.brandColumn;

    const targetLists: TargetList[] = await this.empowerService.getTargetLists(this.selectedClientId, brandItem.id);
    const targetListSection: CmiOsClientBrandSection = {
      name: this.TargetListSection,
      isTarget: true,
      itemSelected: (item: CmiOsClientBrandListItem) => this.onTargetListSelected(item),
      items: targetLists.map((targetList: TargetList) => ({
        id: targetList.id,
        name: `[${targetList.collection}] ${targetList.importFileName}`,
        data: targetList
      }))
    };
    this.appendSection(targetListSection);

  }

  private onTargetListSelected(targetListItem: CmiOsClientBrandListItem) {
    this.clientBrandData.sections.length = this.isSearchMode ? 1 : this.targetListColumn;

    this.count = targetListItem.data.hcpCount;
    const finalSection: CmiOsClientBrandSection = {
      name: targetListItem.name,
      isFinal: true,
      description: this.count.toLocaleString() + ' HCPs'
    };
    this.appendSection(finalSection);

    this.clientBrandData.breadcrumbs = [
      { id: '1', name: targetListItem.data.companyName || this.selectedClient?.name },
      { id: '2', name: targetListItem.data.brandName || this.selectedBrand?.name },
      { id: '3', name: targetListItem.name },
    ];
  }

  private async searchTargetLists(searchTerm: string) {
    this.clientBrandData.breadcrumbs = [];
    const targetLists: TargetListSearch[] = await this.empowerService.searchTargetLists(searchTerm);
    const items: CmiOsClientBrandListItem[] = targetLists.map((targetList: TargetListSearch) => ({
      id: 0,
      name: `[${targetList.collection}] ${targetList.importFileName}`,
      data: targetList
    }));

    if (this.isSearchMode) {
      this.clientBrandData.breadcrumbs = [];
      this.clientBrandData.sections.length = 1;
      this.clientBrandData.sections[0].items = items;
      this.clientBrandData.sections[0].colSpan = this.hcpMaxColumns;
    }
    else {
      this.clientBrandData.sections = [{
        name: 'Target List',
        isTarget: true,
        colSpan: this.hcpMaxColumns,
        itemSelected: (item: CmiOsClientBrandListItem) => this.onTargetListSelected(item),
        items: items
      }]
    }

    if (items.length == 1) {
      items[0].isSelected = true;
      this.onTargetListSelected(items[0]);
    }
  }

  private appendSection(section: CmiOsClientBrandSection) {
    const lastSection = this.clientBrandData.sections[this.clientBrandData.sections.length - 1];

    if (this.isSearchMode && section.isFinal) {
      lastSection.colSpan = this.clientBrandData.columns - 1;
    }
    else {
      lastSection.colSpan = 1;
      section.colSpan = this.clientBrandData.columns - this.clientBrandData.sections.length;
    }

    this.clientBrandData.sections.push(section);
  }
}
