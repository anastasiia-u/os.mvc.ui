import { Injectable } from "@angular/core";
import { EmpowerService } from "@app/core/services/empower.service";
import { FilterService } from "@app/core/services/filter.service";
import { SurveyDataService } from "@app/core/services/survey-data.service";
import { CmiOsClientBrandListItem } from "@cmi/os-library/components/cmi-os-filter-type-dialog";
import { CmiOsOpenSurveyQueryAbstractService } from "@cmi/os-library/services/cmi-os-open-survey-query";
import { TrackingQueryService } from "../filter/components/filter-actions/tracking-query.service";

@Injectable({
    providedIn: 'root'
})
export class OpenTrackingQueryService extends TrackingQueryService implements CmiOsOpenSurveyQueryAbstractService {

    constructor(
        protected override empowerService: EmpowerService,
        protected override filterService: FilterService,
        protected override surveyDataService: SurveyDataService) {
        super(empowerService, filterService, surveyDataService);
    }

    searchInsights(searchTerm: string): Promise<CmiOsClientBrandListItem[]> {
        return this.filterService.searchInsights(searchTerm, this.surveyDataService.surveyTypeId$.value);
    }
}