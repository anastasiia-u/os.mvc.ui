import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';
import { PageModel } from '../models/page.model';
import { PaginationModel } from '../models/pagination.model';
import { SearchFilterModel } from '../models/search-filter.model';
import { SurveyItem } from '../models/survey-item.model';
import { Service } from './service';

@Injectable({
  providedIn: 'root'
})
export class SearchService extends Service {

  constructor(private http: HttpClient) {
    super();
    this.controllerName = 'Search';
  }

  searchByCategory(filter: SearchFilterModel, page: PageModel): Observable<PaginationModel<SurveyItem>> {
    return this.http.post(`${environment.apiUrl}${this.controllerName}/search-by-keyword/${page.pageNumber}/${page.pageSize}`, JSON.stringify(filter), this.httpOptions)
      .pipe(map((response: any) => {
        return this.getPaginationModel(SurveyItem, response);
      }));
  }
}
