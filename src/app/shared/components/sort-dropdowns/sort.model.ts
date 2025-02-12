
export interface SortModel {
    sortColumnName: string;
    isAscending: boolean;
}

export interface VisibilityOptions {
    name: string;
    value: any;
    isHidden: boolean;
}

export enum SortDirection { Ascending, Descending };