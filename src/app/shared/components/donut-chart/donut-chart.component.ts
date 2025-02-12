import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  AfterViewInit,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { ViewDataType } from '@app/core/enums/view-data-type';
import { ButtonType } from '@cmi/os-library/cmi-os-design-library';
import { CmiOsTableViewColumnVisibility } from '@cmi/os-library/components/cmi-os-table-view';
import { createRandomString } from 'src/app/core/helpers/string.helper';
import { SortModel } from '../sort-dropdowns/sort.model';


export interface DonutChartData {
  name: string;
  count: number;
  percentage: number;
  color: string;
  isHidden?: boolean;
  isSelected?: boolean;
  nestedData: DonutChartData[];

}

export interface ValuesDonutChartData extends DonutChartData {
  width: number;
}

export const DountChartColors: string[] = [
  '#3195C5',
  '#DDD5E4',
  '#BBABC8',
  '#A7A9B9',
  '#232951',
  '#9A82AD',
  '#5AAAD1',
  '#EEEAF1',
  '#D6EAF3',
  '#83BFDC',
  '#7B7F97',
  '#ADD5E8',
  '#562E76',
  '#EAF4F9',
  '#785891',
];

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss'],
})
export class DonutChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() chartData: DonutChartData[] = [];

  @Input() viewDataType: ViewDataType = ViewDataType.Percentage;

  @Input() sortOptions?: SortModel;

  @Input() visibilityOptions?: CmiOsTableViewColumnVisibility[];

  viewDataTypeEnum = ViewDataType;

  _aggregationValue: number | null = null;

  buttonTypeEnum = ButtonType;

  protected rootElementId: string;

  _cloneChartData: DonutChartData[] = [];
  private root!: am5.Root;

  private series!: am5percent.PieSeries;




  constructor(private zone: NgZone) {
    this.rootElementId = createRandomString(10);
  }

  ngOnInit() {
    if (this.chartData) {
      this._cloneChartData = JSON.parse(JSON.stringify(this.chartData));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update current data
    if (changes['chartData']) {
      this._cloneChartData = JSON.parse(JSON.stringify(this.chartData));
    }

    this.series?.data.setAll(this.displaySmallValuesOnDonutChart(this._cloneChartData));

    this.calculateAggregation();

    if (changes['visibilityOptions'] || changes['chartData']) {
      this.updateVisibility();

    }

    // if (changes['sortOptions']) this.updateSorting();

  }

  ngAfterViewInit(): void {
    this.displayChart();
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }

  displayChart() {
    this.zone.runOutsideAngular(() => {
      // Create root element
      this.root = am5.Root.new(this.rootElementId);

      // Set themes
      this.root.setThemes([am5themes_Animated.new(this.root)]);

      // Create a donut chart
      const chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.horizontalLayout,
          innerRadius: am5.percent(50),
          width: am5.percent(100),
          height: am5.percent(100),
        })
      );

      // Create series
      this.series = chart.series.push(
        am5percent.PieSeries.new(this.root, {
          name: 'Series',
          valueField: 'width',
          categoryField: 'name',
          alignLabels: true,
        })
      );

      // Hide labels and ticks
      this.series.labels.template.set('visible', false);
      this.series.ticks.template.set('visible', false);

      const data = this.displaySmallValuesOnDonutChart(this._cloneChartData);

      // Set colors dynamically
      this.series.slices.template.adapters.add("fill", (fill, target) => {

        const context: any = target.dataItem?.dataContext;
        const sliceColor: string = context['color'] ?? fill;
        return am5.color(sliceColor);
      });


      const series = this.series;
      this.series.events.on("datavalidated", (evt) => {
        am5.array.each(series.dataItems, (dataItem: any) => {
          if (dataItem.dataContext.hidden) {
            dataItem.hide();
          }
        })
      });

      // Set tooltip
      const tooltip = am5.Tooltip.new(this.root, {
        labelText: '[bold]{category}[/]\nCount: {count}\nPercentage: {percentage}%',
      });

      tooltip.label.setAll({
        maxWidth: 250, // Set the maximum width
        oversizedBehavior: "wrap" // Wrap the text if it exceeds the maxWidth
      });

      this.series.set("tooltip", tooltip);

      this.series.slices.template.setAll({
        strokeWidth: 3,
        stroke: am5.color(0xffffff),
        cornerRadius: 7,
        toggleKey: 'none',
      });

      // Set data
      this.series.data.setAll(data);

      // Make stuff animate on load
      this.series.appear(1000, 100);


      this.updateVisibility();
    });

  }

  rowSelected(row: DonutChartData, isRoot: boolean) {
    if (isRoot && row.nestedData.length) {
      return;
    }

    row.isSelected = !row.isSelected;

    this.calculateAggregation();
  }

  onReset() {
    this._cloneChartData.forEach(item => {

      item.isSelected = false;

      item.nestedData.forEach(sItem => {
        sItem.isSelected = false;
      });

    });
    this._aggregationValue = null;
  }

  private getColor(index: number): string {
    const colorIndex = index % DountChartColors.length;

    return DountChartColors[colorIndex];
  }

  private calculateAggregation() {

    let value = 0;

    this._cloneChartData.forEach(item => {

      if (item.isSelected) {
        value += this.viewDataType === ViewDataType.Percentage ? item.percentage : item.count;
      }

      if (item.nestedData) {

        if (this.viewDataType === ViewDataType.Percentage) {
          value += item.nestedData.filter(x => x.isSelected).map(x => x.percentage).reduce((a, b) => a + b, 0);
        } else {
          value += item.nestedData.filter(x => x.isSelected).map(x => x.count).reduce((a, b) => a + b, 0);
        }

      }

    });

    this._aggregationValue = this.viewDataType == ViewDataType.Percentage && value > 100 ? 100 : value;
  }

  private displaySmallValuesOnDonutChart(chartData: DonutChartData[]) {

    const data = JSON.parse(JSON.stringify(chartData)) as ValuesDonutChartData[];

    data.filter(x => x.percentage > 0).forEach(item => {
      item.width = item.percentage < 1 ? 1 : item.percentage;
    });

    return data;
  }

  private updateVisibility() {
    if (this.visibilityOptions && this.visibilityOptions.length && this.series) {

      let tempChartData: DonutChartData[] = JSON.parse(JSON.stringify(this._cloneChartData));

      this.visibilityOptions.forEach(opt => {
        if (opt.isHidden) {
          const found = this.series.dataItems.find(di => (di.dataContext as any).name == opt.name);
          found?.hide(0);

          tempChartData = tempChartData.filter(f => f.name != opt.name);
        }
      });

      // Update legends
      this._cloneChartData = tempChartData;

      // Reset the aggregation
      this.onReset();
    }
  }

  private updateSorting() {
    if (this.sortOptions) {
      this._cloneChartData.sort((a, b) => {
        const aValue = a.nestedData.reduce((acc, val) => {
          acc += val.count;
          return acc;
        }, 0) + a.count;
        const bValue = b.nestedData.reduce((acc, val) => {
          acc += val.count;
          return acc;
        }, 0) + b.count;

        if (!aValue || !bValue) return 0;

        if (this.sortOptions) {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
  }
}
