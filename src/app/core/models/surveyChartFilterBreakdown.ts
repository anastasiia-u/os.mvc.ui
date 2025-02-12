import { ChartFilterType } from "../enums/chart-filter-type.enum";
import { IChartFilterResults } from "./surveyChartFilter";

export interface IChartFilterBreakdown {
  sectionId: number;
  categoryId: number;
  questionId: number;
  answerIds: number[];
  breakdownType: ChartFilterType;

  filters: IChartFilterResults[];
}
