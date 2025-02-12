import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ViewDataType } from '@app/core/enums/view-data-type';
import { CmiOsTableViewColumnVisibility } from '@cmi/os-library/components/cmi-os-table-view';
import { SortModel } from '../sort-dropdowns/sort.model';

export interface BarChartData {
  name: string;
  count: number;
  percentage: number;
  color: string;
  isVissible: boolean;
  nestedData: BarChartData[];

}

export const BarChartColors: string[] = [
  '#D88950',
  '#D86070',
  '#6650D8',
  '#5083D8',
  '#80D850',
  '#C0D850',
  '#8B50D8',
  '#000000',
  '#D85095',
  '#50D1C2'
];

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnChanges {

  @Input()
  chartData: BarChartData[] = [];

  @Input()
  viewDataType: ViewDataType = ViewDataType.Percentage;

  @Input() sortOptions?: SortModel;

  @Input() visibilityOptions?: CmiOsTableViewColumnVisibility[];

  viewDataTypeEnum = ViewDataType;

  tooltipRow!: BarChartData;

  visibilityRows: string[] = [];

  ngOnChanges(change: SimpleChanges): void {

    this.updateVisibility();

    if (change['sortOptions']) {

      const options: SortModel = change['sortOptions'].currentValue;

      if (!options) return;

      this.chartData.sort((a, b) => {

        const aValue = a.nestedData.reduce((acc, val) => {
          acc += val.count;
          return acc;
        }, 0) + a.count;
        const bValue = b.nestedData.reduce((acc, val) => {
          acc += val.count;
          return acc;
        }, 0) + b.count;

        if (!aValue || !bValue) return 0;

        if (options.isAscending) {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
  }

  calculateWidth(row: BarChartData, data: BarChartData[]) {
    let max = Math.max(...data.map(x => x.count));

    const percentage = (row.count / max) * 100;

    return percentage;
  }

  calculateNestedWidth(count: number, totalResponses: number, rootWidth: number) {
    return (count / totalResponses) * rootWidth;
  }

  showToltip(row: BarChartData) {
    this.tooltipRow = row;
  }

  private updateVisibility() {
    if (this.visibilityOptions && this.visibilityOptions.length) {
      const cols = this.visibilityOptions.filter((x: any) => !x.isHidden).map((y: any) => y.name);
      this.visibilityRows = cols;
    } else {
      this.visibilityRows = this.chartData.map(x => x.name);
    }

    this.chartData.forEach(x => {
      x.isVissible = this.visibilityRows.includes(x.name);
    })
  }

}
