import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CmiOsDropdownSimpleOption } from '@cmi/os-library/components/cmi-os-dropdown-simple';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterTypeEnum } from '../enums/filter-type.enum';
import { Category, SelectedCategory } from '../models/categories.model';
import { ChartFiltersData } from '../models/chart-fillters-data';
import { Insights, SearchInsights } from '../models/filter-type';
import { MedicalSpecialty } from '../models/medical-specialty.model';
import { Question, SelectedQuestion } from '../models/question.model';
import { ReportingPeriod, SelectedReportingPeriod } from '../models/reporting-period.model';
import { SubQuestionResponse } from '../models/sub-question-response.model';
import { Service } from './service';

@Injectable({
  providedIn: 'root'
})
export class FilterService extends Service {

  constructor(private http: HttpClient) {
    super();

    this.controllerName = 'filter';
  }

  loadSurveyTypes(): Observable<CmiOsDropdownSimpleOption[]> {
    return this.http.get<CmiOsDropdownSimpleOption[]>(environment.apiUrl + this.controllerName + '/survey-types', this.httpOptions);
  }

  loadReportingPeriods(surveyTypeId: number): Observable<ReportingPeriod[]> {
    return this.http.get<ReportingPeriod[]>(environment.apiUrl + this.controllerName + `/reporting-periods?surveyTypeId=${surveyTypeId}`, this.httpOptions);
  }

  loadMedicalSpecialties(): Observable<MedicalSpecialty[]> {
    return this.http.get<MedicalSpecialty[]>(environment.apiUrl + this.controllerName + '/medical-specialties', this.httpOptions);
  }

  loadCategoriesByReportingPeriod(reportingPeriodList: SelectedReportingPeriod): Observable<Category[]> {
    return this.http.post<Category[]>(environment.apiUrl + this.controllerName + '/categories-by-reporting-period', reportingPeriodList, this.httpOptions);
  }

  loadQuestions(selectedCategory: SelectedCategory): Observable<Question[]> {
    return this.http.post<Question[]>(environment.apiUrl + this.controllerName + '/questions', selectedCategory, this.httpOptions);
  }

  loadSubQuestionsResponses(selectedQuestion: SelectedQuestion): Observable<SubQuestionResponse[]> {
    return this.http.post<SubQuestionResponse[]>(environment.apiUrl + this.controllerName + '/sub-questions-responses', selectedQuestion, this.httpOptions);
  }

  getInsights(campaignId: number, surveyTypeId: number): Promise<Insights[]> {
    return firstValueFrom(this.http.get<Insights[]>(
      `${environment.apiUrl}${this.controllerName}/insights/${campaignId}/${surveyTypeId}`, this.httpOptions));
  }

  searchInsights(searchTerm: string, surveyTypeId: number): Promise<SearchInsights[]> {
    return firstValueFrom(this.http.post<SearchInsights[]>(
      `${environment.apiUrl}search/insights?searchTerm=${searchTerm}&surveyTypeId=${surveyTypeId}`, {}, this.httpOptions));
  }

  async getFilterTypeCount(filterType: FilterTypeEnum): Promise<number> {
    return firstValueFrom(this.http.get<number>(
      `${environment.apiUrl}${this.controllerName}/filter-type/${filterType}/count`, this.httpOptions));
  }

  loadChartFiltersData(data: SelectedReportingPeriod): Observable<ChartFiltersData[]> {
    return this.http.post<ChartFiltersData[]>(environment.apiUrl + this.controllerName + '/chart-filters', data, this.httpOptions);
  }

}