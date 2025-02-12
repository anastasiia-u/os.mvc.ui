import { SurveyCardItemResult } from "./survey-card-item";

export class SurveySection {
    id: number = 0;
    htmlId: string = '';
    name: string = '';
    icon: string = '';
    position: number = 0;
    isActive: boolean = false;
    isEnabled: boolean = false;
    isLoading: boolean = false;
    isVisible: boolean = false;
    fullWidthResults: SurveyCardItemResult[] = [];
    halfWidthResults: SurveyCardItemResult[] = [];

    clear() {
        this.isActive = false;
        this.isEnabled = false;
        this.isLoading = false;
        this.isVisible = false;
        this.fullWidthResults = [];
        this.halfWidthResults = [];
    }
}  