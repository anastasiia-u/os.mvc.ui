export enum ViewTypes { BarChart, PieChart, Table }

export interface ViewSelectorOption {
    isActive: boolean;
    viewType: ViewTypes;
}