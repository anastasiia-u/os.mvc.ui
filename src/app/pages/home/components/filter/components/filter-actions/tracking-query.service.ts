import { Injectable } from "@angular/core";
import { EmpowerService } from "@app/core/services/empower.service";
import { FilterService } from "@app/core/services/filter.service";
import { SurveyDataService } from "@app/core/services/survey-data.service";
import { CmiOsClientBrandListItem } from "@cmi/os-library/components/cmi-os-filter-type-dialog";
import { AbstractCmiOsSaveSurveyQueryService } from "@cmi/os-library/services/cmi-os-save-survey-query";

@Injectable({
    providedIn: 'root'
})
export class TrackingQueryService extends AbstractCmiOsSaveSurveyQueryService {

    constructor(
        protected empowerService: EmpowerService,
        protected filterService: FilterService,
        protected surveyDataService: SurveyDataService
    ) {
        super();
    }

    getClients(): Promise<CmiOsClientBrandListItem[]> {
        return this.empowerService.getClients();
    }
    getBrands(clientId: number): Promise<CmiOsClientBrandListItem[]> {
        return this.empowerService.getBrands(clientId);
    }

    getCampaigns(companyId: number, brandId: number): Promise<CmiOsClientBrandListItem[]> {
        return this.empowerService.getOptimaCampaigns(companyId, brandId, this.surveyDataService.surveyTypeId$.value);
    }

    getInsights(campaignId: number): Promise<CmiOsClientBrandListItem[]> {
        return this.filterService.getInsights(campaignId, this.surveyDataService.surveyTypeId$.value);
    }
}