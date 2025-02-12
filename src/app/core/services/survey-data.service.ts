import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartFilterType } from '@app/core/enums/chart-filter-type.enum';
import { CmiOsTableViewInput } from '@cmi/os-library/components/cmi-os-table-view';
import { CmiOsSaveSurveyQueryModel } from '@cmi/os-library/services/cmi-os-save-survey-query';
import { environment } from '@env/environment';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SurveyType } from '../enums/survey-type.enum';
import { HcpTargetListResult } from '../models/hcp-target-list-result.model';
import { SurveySection } from '../models/survey-section.model';
import { IChartFilterResults } from '../models/surveyChartFilter';
import { Service } from './service';

export interface ISurveyRequest {
  surveyTypeId: number;
  reportingPeriodId: number,
  categoryIds: number[];
  questionIds: number[];
  answerIds: number[];
  specialtyIds: number[];
  collectionId?: string;
  filterType: number;
  chartFilters: IChartFilterResults[];


  breakdownOption: ChartFilterType | null;

}


export interface ITrackingSurveyRequest extends CmiOsSaveSurveyQueryModel {
  targetListName?: string,
  filterData: ISurveyRequest
}

export interface ISurveyResponse {
  categories: ISurveyCategory[];
}

export interface ISurveyCategory {
  id: number,
  value: string;
  sectionName: string;
  questions: ISurveyQuestion[]
}

export interface ISurveyQuestion {
  id: number,
  value: string;
  questionType: string;
  code: string;
  universeCount: number;
  audienceCount: number;
  answers: ISurveyAnswer[];
}

export interface ISurveySubQuestion {
  id: number,
  value: string;
  count: number;
  percent: number;
  percentFormatted: string;
  indexVal: number;
  specialities: ISurveySpeciality[];
  answers: ISurveyAnswer[];
  answerIds: number[];
}

export interface ISurveyAnswer {
  id: number,
  value: string;
  count: number;
  percent: number;
  percentFormatted: string;
  indexVal: number;
  order: number;
  breakdownValue: string;

  subQuestions: ISurveySubQuestion[];
  specialities: ISurveySpeciality[];
}

export interface ISurveySpeciality {
  id: number,
  value: string;
  count: number;
  percent: number;
  percentFormatted: string;
  indexVal: number;
}

export interface IChartLayerData {
  question: string;
  questionType: string;
  isVisible: boolean;
  tableChartInput: CmiOsTableViewInput;
}

@Injectable({
  providedIn: 'root'
})
export class SurveyDataService extends Service {

  constructor(private http: HttpClient) {
    super();
    this.controllerName = 'survey';
  }

  reportingPeriodId$ = new BehaviorSubject<number>(0);

  defaultReportingPeriod$ = new BehaviorSubject<number>(0);

  surveyTypeId$ = new BehaviorSubject<number>(0);

  defaultSurveyType$ = new BehaviorSubject<number>(0);

  specialtyIds$ = new BehaviorSubject<number[]>([]);

  categoryIds$ = new BehaviorSubject<number[]>([]);

  questionIds$ = new BehaviorSubject<number[]>([]);

  subQuestionResponseIds$ = new BehaviorSubject<number[]>([]);

  surveyData$ = new BehaviorSubject<ISurveyResponse>({ categories: [] });

  hcpTargetList$ = new BehaviorSubject<HcpTargetListResult | null>(null);

  openSaveResult$ = new BehaviorSubject<CmiOsSaveSurveyQueryModel | null>(null);

  trackingQuery$ = new BehaviorSubject<ITrackingSurveyRequest | null>(null);

  surveySections$ = new BehaviorSubject<SurveySection[]>([]);

  filterType$ = new BehaviorSubject<number>(0);

  resetDone$ = new BehaviorSubject<boolean>(false);

  loadData() {
    const resuest: ISurveyRequest = this.getSurveyFilterData();

    this.getSurveyResults(resuest).subscribe(data => {
      this.surveyData$.next(data);
    });
  }

  loadSingleChart(filters: IChartFilterResults[], categoryId: number, questionid: number, answerIds: number[], breakdownOption: ChartFilterType | null = null) {
    const request: ISurveyRequest = this.getSurveyFilterData();

    request.chartFilters = filters;
    request.categoryIds = [categoryId];
    request.questionIds = [questionid]
    request.answerIds = answerIds;

    if (breakdownOption)
      request.breakdownOption = breakdownOption;

    return this.getSurveyResults(request);
  }

  clearResults() {
    this.surveyData$.next({ categories: [] });
  }

  getSurveyResults(request: ISurveyRequest): Observable<ISurveyResponse> {
    return this.http.post(`${environment.apiUrl}${this.controllerName}/results`, JSON.stringify(request), this.httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  saveSurveyResults(result: CmiOsSaveSurveyQueryModel): Observable<number> {

    const surveyData = this.getSurveyFilterData();

    if (!surveyData.collectionId) {
      surveyData.collectionId = surveyData.filterType.toString();
    }

    const request: ITrackingSurveyRequest = {
      clientId: result.clientId,
      brandId: result.brandId,
      campaignId: result.campaignId,
      insightId: result.insightId,
      name: result.name,
      targetListName: this.hcpTargetList$.value?.name,
      filterData: surveyData
    };

    return this.http.post(`${environment.apiUrl}${this.controllerName}/save-results`, JSON.stringify(request), this.httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  openSurveyResults(id: number): Observable<ITrackingSurveyRequest> {
    return this.http.get(`${environment.apiUrl}${this.controllerName}/open-results/${id}`, this.httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  isConsumerSurveyType() {
    return this.surveyTypeId$.value === SurveyType.Consumer;
  }

  isCorporateSurveyType() {
    return this.surveyTypeId$.value === SurveyType.Corporate;
  }

  isProfessionalSurveyType() {
    return this.surveyTypeId$.value === SurveyType.Professional;
  }

  isGlobalProfessionalSurveyType() {
    return this.surveyTypeId$.value === SurveyType.GlobalProfessional;
  }

  isPayerSurveyType() {
    return this.surveyTypeId$.value === SurveyType.Payer;
  }

  private getSurveyFilterData(): ISurveyRequest {
    return {
      surveyTypeId: this.surveyTypeId$.value,
      reportingPeriodId: this.reportingPeriodId$.value,
      specialtyIds: this.specialtyIds$.value,
      categoryIds: this.categoryIds$.value,
      questionIds: this.questionIds$.value,
      answerIds: this.subQuestionResponseIds$.value,
      filterType: this.filterType$.value,
      collectionId: this.hcpTargetList$.value?.collection,
      chartFilters: [],
      breakdownOption: null
    }
  }
}
