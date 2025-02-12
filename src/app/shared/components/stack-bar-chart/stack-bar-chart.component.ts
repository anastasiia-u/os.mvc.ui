import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ViewDataType } from '@app/core/enums/view-data-type';
import { ButtonType, NotificationService } from '@cmi/os-library/cmi-os-design-library';
import { CmiOsTableViewColumnVisibility } from '@cmi/os-library/components/cmi-os-table-view';
import { SortModel } from '../sort-dropdowns/sort.model';

export interface StackedBarChartData {
  name: string,
  value: number,

  isSelected: boolean,
  colorIndex: number
}

export const CHART_COLORS = [
  '#562E76', // Purple primary,
  '#9A82AD', // Purple 60,
  '#A7A9B9', // Dark purple 40

  '#C0D850', // Cyan primary
  '#D9E8A0', // Cyan 60
  '#3195C5', // Blue primary
  '#83BFDC', // Blue 60

  '#5A605D', // Grey Primary
  '#9CA09E', // Grey 60
];


export interface StackBarChart {
  title: string;
  isMain: boolean,
  chartData: StackedBarChartData[];
}

export interface StackBarResponse {
  name: string;
  color: string;
  isSelected: boolean;
  isVissible: boolean;
}

export interface StackBarLine {
  width: number,
  color: string,
  response: string
  value: number;
}

@Component({
  selector: 'app-stack-bar-chart',
  templateUrl: './stack-bar-chart.component.html',
  styleUrls: ['./stack-bar-chart.component.scss']
})
export class StackBarChartComponent implements OnChanges {

  @Input() chartData: StackBarChart[] = [];
  @Input() chartLegend: StackedBarChartData[] = [];
  @Input() viewDataType: ViewDataType = ViewDataType.Percentage;
  @Input() visibilityOptions?: CmiOsTableViewColumnVisibility[];








  @Input() sortOptions?: SortModel;

  @Input() showAggregation: boolean = true;


  viewDataTypeEnum = ViewDataType;

  tooltipRow!: StackedBarChartData;

  responses: StackBarResponse[] = [];

  buttonTypeEnum = ButtonType;


  constructor(private notificationService: NotificationService,
  ) { }

  ngOnChanges(change: SimpleChanges): void {

    // Update Responses
    this.responses = this.chartLegend.map(x => ({ isSelected: false, isVissible: true, name: x.name, color: this.getColor(x.colorIndex) }));

    if (!change['viewDataType']) {
      this.resetAggregation();
    }
  }

  calculateWidth(data: StackedBarChartData, chartData: StackedBarChartData[]): number {

    const max = Math.max(...chartData.map(x => x.value));

    const percentage = (data.value / max) * 100;

    return Math.max(percentage, 1);
  }

  getColor(index: number): string {
    const colorIndex = index % CHART_COLORS.length;

    return CHART_COLORS[colorIndex];
  }

  showToltip(row: StackedBarChartData) {
    this.tooltipRow = row;
  }

  showGroupToltip(row: StackBarLine) {

    this.tooltipRow = {
      name: row.response,
      value: row.value,
      isSelected: false,
      colorIndex: 0
    };
  }

  show(row: StackBarChart) {
    return !row.chartData.every(x => x.value === 0);
  }

  aggregateResponse(response: StackBarResponse) {

    if (!this.showAggregation) {
      return;
    }

    // Verify how many responses that they are selected, before uncheck
    // Base on this we have to desaggregate the chart if we had 2 and now only 1
    const cloneResponses: StackBarResponse[] = JSON.parse(JSON.stringify(this.responses));
    const previousSelectedResponses = (cloneResponses.filter(x => x.isSelected))?.length ?? 0;


    response.isSelected = !response.isSelected;
    const aggregatedResponses = this.responses.filter(x => x.isSelected);
    if (aggregatedResponses.length === 1) {
      this.notificationService.info('Choose at least one more response to get a combined result', { duration: 20000 }); // verticalPosition: 'top'

      // Update chart based on selectd number selected previous
      if (previousSelectedResponses == 2) {
        this.resetAggregation(false);
      }
    }
    else if (aggregatedResponses.length > 1) {

      this.hideNotification()

      const responses = aggregatedResponses.map(x => x.name);

      this.chartData.forEach(x => {
        x.chartData.forEach(r => {
          r.isSelected = responses.includes(r.name);
        });
      });
    }
    else {
      this.hideNotification();
      this.resetAggregation(false);
    }
  }

  calculateAggregationData(row: StackBarChart) {

    const aggRows = row.chartData.filter(x => x.isSelected && x.value > 0);

    const data: StackBarLine[] = [];

    let totalWidth: number = 0;

    aggRows.forEach(item => {

      const stackBarLine: StackBarLine = {
        value: item.value,
        color: this.responses.find(x => x.name == item.name)?.color ?? '#000',
        response: item.name,
        width: this.calculateWidth(item, aggRows)
      };

      data.push(stackBarLine);

      totalWidth += this.calculateWidth(item, row.chartData);

    });

    let totalPercentage = data.map(x => x.value).reduce((a, b) => a + b, 0);

    if (totalPercentage > 100) {
      totalPercentage = 100;
    }

    // https://cmicompas.atlassian.net/browse/IBS-1642
    if (totalPercentage >= 98 && row.chartData.every(x => x.isSelected /*&& x.isVissible*/)) {
      totalPercentage = 100;
    }

    return {
      totalCount: data.map(x => x.value).reduce((a, b) => a + b, 0),
      totalPercentage: totalPercentage,
      totalWidth: totalWidth,
      group: data
    };
  }

  identify(index: number, item: StackBarLine) {
    return item.value;
  }

  resetAggregation(force: boolean = true) {
    this.chartData.forEach(x => {
      x.chartData.forEach(r => {
        r.isSelected = false
      });
    });

    if (force) {
      this.responses.forEach(x => x.isSelected = false);
    }
  }

  get showAggregationInfo() {
    return this.showAggregation && this.responses.some(x => x.isVissible);
  }

  get showResetAggreagationBtn() {
    return this.responses.some(x => x.isSelected);
  }
  private hideNotification() {
    const snackBar = document.getElementsByClassName('mdc-snackbar')[0];

    if (snackBar) {
      (snackBar as any).style.display = 'none'
    }
  }
}
