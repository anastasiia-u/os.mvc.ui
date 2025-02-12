import { ViewTypes } from "@app/shared/components/view-selector/view-types";
import { ViewDataType } from "../enums/view-data-type";
import { ISurveyQuestion } from "../services/survey-data.service";

export class SurveyCardItemResult {

  question: ISurveyQuestion;



  isLoading: boolean;
  sectionName: string
  card: any;
  questionId: number;
  categoryId: number;
  answerIds: number[];
  layers: any | null;
  questionType: string;
  isAverage: boolean;

  viewType: ViewTypes | null;
  viewDataType: ViewDataType;

  constructor(item?: SurveyCardItemResult) {
    if (!item) {
      return;
    }

    this.question = item.question || null;


    this.isLoading = item.isLoading || false;
    this.sectionName = item.sectionName || '';
    this.card = item.card || null;
    this.layers = item.layers || null;
    this.questionId = item.questionId || 0;
    this.categoryId = item.categoryId || 0;
    this.answerIds = item.answerIds || [];
    this.questionType = item.questionType || '';
    this.isAverage = item.isAverage || false;

    this.viewType = item.viewType || null;
    this.viewDataType = item.viewDataType || ViewDataType.Percentage;

  }
}
