import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Brand, Campaign, Client, TargetList, TargetListSearch } from "src/app/core/models/filter-type";
import { environment } from "src/environments/environment";
import { Service } from "./service";

@Injectable({
  providedIn: 'root'
})
export class EmpowerService extends Service {

  constructor(private http: HttpClient) {
    super();

    this.controllerName = 'filtertype';
  }

  public async getClients(): Promise<Client[]> {
    return firstValueFrom(this.http.get<Client[]>(
      `${environment.apiUrl}${this.controllerName}/clients`, this.httpOptions));
  }

  public async getBrands(clientId: number): Promise<Brand[]> {
    return firstValueFrom(this.http.get<Brand[]>(
      `${environment.apiUrl}${this.controllerName}/brands/${clientId}`, this.httpOptions));
  }

  public async getTargetLists(clientId: number, brandId: number): Promise<TargetList[]> {
    return firstValueFrom(this.http.get<TargetList[]>(
      `${environment.apiUrl}${this.controllerName}/targetlists/${clientId}/${brandId}`, this.httpOptions));
  }

  public async searchTargetLists(filter: string): Promise<TargetListSearch[]> {
    return firstValueFrom(this.http.post<TargetListSearch[]>(
      `${environment.apiUrl}${this.controllerName}/targetlists/search?targetListFilter=${filter}`, this.httpOptions));
  }

  public async getOptimaCampaigns(companyId: number, brandId: number, surveyTypeId: number): Promise<Campaign[]> {
    return firstValueFrom(this.http.get<Campaign[]>(
      `${environment.apiUrl}${this.controllerName}/optimacampaigns/${companyId}/${brandId}/${surveyTypeId}`, this.httpOptions));
  }

  public getTargetListByCollectionId(collectionid: string): Observable<TargetListSearch> {
    return this.http.get<TargetListSearch>(
      `${environment.apiUrl}${this.controllerName}/targetlists/${collectionid}`, this.httpOptions);
  }
}