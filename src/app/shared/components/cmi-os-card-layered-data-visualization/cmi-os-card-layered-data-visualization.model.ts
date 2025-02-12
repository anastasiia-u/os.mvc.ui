import { CmiOsTableViewColumnItem } from "@cmi/os-library/components/cmi-os-table-view";

export class CmiOsCardLayeredDataVisualizationInput {
    translations: CmiOsCardTranslationsInput;

    // Card input info
    cardTitle: string;
    cardPeriod: string;
    isViewModeChart: boolean;

    referenceId: string;
    htmlContainerId: string;
    title: string;
    exportTitle: string;
    exportAllTitle: string;
    sectionName: string;
    aggregationColumnName: string;

    totalAudienceValue: string;
    totalUniverseValue: string;
    hasData: boolean;

    questionType: string;

    // Possible objects inside of card
    tableInput: CmiOsCardTableViewInput | null;
    tableChartInput: CmiOsCardTableViewInput | null;

    // Export Input
    isExportAvailable: boolean;
    fieldToExportDetails: any[];

    sortOptions: any;

    constructor(item?: CmiOsCardLayeredDataVisualizationInput) {
        this.translations = new CmiOsCardTranslationsInput();
        if (item && item.translations) {
            // iterate over the  object, and copy the values
            for (const key in item.translations) {
                if (item.translations[key] && item.translations[key] != '')
                    this.translations[key] = item.translations[key];
            }
        }

        this.cardTitle = item && item.cardTitle || '';
        this.cardPeriod = item && item.cardPeriod || '';
        this.isViewModeChart = item && item.isViewModeChart || false;

        this.referenceId = item && item.referenceId || '';
        this.htmlContainerId = item && item.htmlContainerId || '';
        this.title = item && item.title || '';
        this.exportTitle = item && item.exportTitle || '';
        this.exportAllTitle = item && item.exportAllTitle || '';
        this.sectionName = item && item.sectionName || '';
        this.aggregationColumnName = item && item.aggregationColumnName || '';

        this.totalAudienceValue = item && item.totalAudienceValue || '';
        this.totalUniverseValue = item && item.totalUniverseValue || '';
        this.hasData = item && item.hasData || false;

        this.questionType = item && item.questionType || '';

        this.tableInput = item && item.tableInput || null;
        this.tableChartInput = item && item.tableChartInput || null;

        // Export Input
        this.isExportAvailable = item && item.isExportAvailable || false;
        this.fieldToExportDetails = item && item.fieldToExportDetails || [];
    }
}

export class CmiOsCardTableViewInput {
    referenceId: string;
    groupHtmlContainerId: string;
    htmlContainerId: string;
    messageNoData: string;
    title: string;
    exportTitle: string;
    sectionName: string;
    aggregationColumnName: string;

    data: any[] = [];

    // Table input
    columns: CmiOsTableViewColumnItem[] = [];

    isNestedModeOn: boolean;
    propertyParent: string;
    propertyIsParent: string;

    sortField: string;
    sortFieldOrder: string;

    isColumnFilterActive?: boolean;
    hideColumns?: boolean;

    constructor(item?: CmiOsCardTableViewInput) {
        this.referenceId = item && item.referenceId || '';
        this.groupHtmlContainerId = item && item.groupHtmlContainerId || '';
        this.htmlContainerId = item && item.htmlContainerId || '';
        this.messageNoData = item && item.messageNoData || '';
        this.title = item && item.title || '';
        this.exportTitle = item && item.exportTitle || '';
        this.sectionName = item && item.sectionName || '';
        this.aggregationColumnName = item && item.aggregationColumnName || '';

        this.data = [];
        if ((item?.data?.length ?? 0) > 0)
            this.data = JSON.parse(JSON.stringify(item?.data));

        this.columns = [];
        if ((item?.columns?.length ?? 0) > 0) {
            item?.columns.forEach(column => this.columns.push(new CmiOsTableViewColumnItem(column)));
        }

        this.isNestedModeOn = item && item.isNestedModeOn || false;
        this.propertyParent = item && item.propertyParent || '';
        this.propertyIsParent = item && item.propertyIsParent || '';

        this.sortField = item && item.sortField || '';
        this.sortFieldOrder = item && item.sortFieldOrder || '';
    }
}

/// TRANSLATIONS to labels
export class CmiOsCardTranslationsInput {
    [key: string]: string;
    cardTitleLabel: string;
    cardAreaSubtitleLabel: string;
    cardAreaResumeTitleLabel: string;
    cardAreaResumeTotalLabel: string;
    cardAreaAggregationResetLabel: string;
    audienceTooltipText: string;
    universeTooltipText: string;

    constructor(item?: CmiOsCardTranslationsInput) {
        this.cardTitleLabel = item && item.cardTitleLabel || '[cardTitleLabel]';
        this.cardAreaSubtitleLabel = item && item.cardAreaSubtitleLabel || '[cardAreaSubtitleLabel]';
        this.cardAreaResumeTitleLabel = item && item.cardAreaResumeTitleLabel || '[cardAreaResumeTitleLabel]';
        this.cardAreaResumeTotalLabel = item && item.cardAreaResumeTotalLabel || '[cardAreaResumeTotalLabel]';
        this.cardAreaAggregationResetLabel = item && item.cardAreaAggregationResetLabel || '[cardAreaAggregationResetLabel]';
        this.audienceTooltipText = item && item.audienceTooltipText || '';
        this.universeTooltipText = item && item.universeTooltipText || '';
    }
}