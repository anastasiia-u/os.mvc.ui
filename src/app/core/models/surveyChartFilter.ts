import { ChartFilterType } from "../enums/chart-filter-type.enum";

export interface IChartFilterResults {
    key: ChartFilterType;
    values: string[];
}