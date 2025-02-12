import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewDataType } from './../../../core/enums/view-data-type';
import { StackBarChart } from './../stack-bar-chart/stack-bar-chart.component';

import { IChartLayerData, ISurveyAnswer, ISurveyQuestion } from '@app/core/services/survey-data.service';


// CMIOS COMPONENTS
import { CmiOsTableViewColumnItem, CmiOsTableViewColumnVisibility, CmiOsTableViewInput } from '@cmi/os-library/components/cmi-os-table-view';
import { CmiOsCardLayeredDataVisualizationInput } from './cmi-os-card-layered-data-visualization.model';

// CMIOS SERVICES
import { QuestionType } from '@app/core/enums/question-type';
import { SurveySection } from '@app/core/models/survey-section.model';
import { SelectItem } from '@cmi/os-library/cmi-os-design-library';
import { CmiOsGlobalLoadingService } from '@cmi/os-library/components/cmi-os-global-loading';
import { CmiOsDataExportElement, CmiOsDataExportPropertyDetail, CmiOsDataExportService, CmiOsDataExportSettings } from '@cmi/os-library/services/cmi-os-data-export';
import { CmiOsDataFormattingService } from '@cmi/os-library/services/cmi-os-data-formatting';
import { BarChartData } from '../bar-chart/bar-chart.component';
import { DonutChartData, DountChartColors } from '../donut-chart/donut-chart.component';
import { SortDirection } from '../sort-dropdowns/sort.model';
import { StackedBarChartData } from '../stack-bar-chart/stack-bar-chart.component';
import { ViewTypes } from '../view-selector/view-types';

export interface TableFilterItem {
  name: string,
  checked: boolean
}

@Component({
  selector: 'app-cmi-os-card-layered-data-visualization',
  templateUrl: './cmi-os-card-layered-data-visualization.component.html',
  styleUrls: ['./cmi-os-card-layered-data-visualization.component.scss']
})
export class CmiOsCardLayeredDataVisualizationComponent implements OnChanges {

  @Input() set isLoading(value: boolean) { this._isLoading = value; }
  @Input() question: ISurveyQuestion;
  @Input() section: SurveySection;
  @Input() UniversalLabelText: string;
  @Input() categoryId: string;

  @Input() input: CmiOsCardLayeredDataVisualizationInput;


  // Default settings to display data
  _isViewModeChart: boolean = true;
  _viewType: ViewTypes = ViewTypes.BarChart;
  _viewDataType: ViewDataType = ViewDataType.Percentage;
  _isAverage: boolean = false;

  // Sort Settings
  _sortByOptions: SelectItem[] = [];
  _sortOrderOptions: SelectItem[] = [{ value: SortDirection.Ascending, name: 'Ascending' }, { value: SortDirection.Descending, name: 'Descending' }];
  _visibilityOptions: SelectItem[] = [];

  _currentSortOptions: any = null;
  _currentVisibilityOptions: any[] = [];
  _currentColorsOrder: any[] = [];

  // Table settings
  _tableInput!: CmiOsTableViewInput | null;
  _tableColumns: any[] = [];



  // HTML Vars
  _htmlContainerParentPreffix = 'parent_';
  _htmlContainerChartSuffix = '_chart';
  _htmlContainerTableSuffix = '_table';
  _isLoading: boolean = false;

  _iconNamespace = 'cardViewSection';

  _minHeight = 0;

  _aggregationValues: any[] = [];





  _selectedRows: any[] = [];
  _isSelectable: boolean = false;
  _isRowReset: number = 0;

  _filterValues: TableFilterItem[] = [];

  _selectedCheckboxes: any = {};

  stackBarChartData: StackBarChart[] = [];
  stackBarChartColumns: StackedBarChartData[] = [];


  donutChartData: DonutChartData[] = [];

  barChartData: BarChartData[] = [];


  isToAggregate: boolean = false;


  // Inform parent the current view mode
  @Output() public viewModeChanged: EventEmitter<any> = new EventEmitter();

  @Output() OnViewModeChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private dataFormattingService: CmiOsDataFormattingService,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private loaderService: CmiOsGlobalLoadingService,
    private exportService: CmiOsDataExportService) {

    this.input = new CmiOsCardLayeredDataVisualizationInput();
    this._tableInput = null;

    this.addSvgIcons();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['question']) {
      // Prepare the info to show on card
      setTimeout(() => {

        this.updateSortAndVisibilityOptions();

        this.updateCard();
        this._isLoading = false;
      }, 50);
    }



  }



  onViewModeChanged(viewType: ViewTypes) {


    if (((viewType === ViewTypes.BarChart || viewType === ViewTypes.PieChart) && !this._isViewModeChart)
      ||
      (viewType === ViewTypes.Table && this._isViewModeChart)
    ) {
      this.fnToggleViewModeClick();
      this._viewType = viewType;


      if (this._isAverage
        ||
        (this.question.questionType == QuestionType.SingleChoise || this.question.questionType == QuestionType.MultipleChoise)
      ) {
        // Reset - hide all
        this._tableInput?.columns.forEach((column, idx) => {
          if (idx == 0)
            return;
          column.isToHide = true;
        });

        // just display the correct option
        this._tableInput?.columns.forEach((column, idx) => {
          if (idx == 0)
            return;

          if (this._viewDataType == ViewDataType.Count && column.property == 'count') {
            column.isToHide = false;
          }
          else if (this._viewDataType == ViewDataType.Percentage && column.property == 'percentage') {
            column.isToHide = false;
          }
        });
      }

      // Update sort options
      if (this.question.questionType == QuestionType.GridMultipleChoise || this.question.questionType == QuestionType.GridSingleChoise) {
        if (viewType == ViewTypes.Table) {

          this._sortByOptions = [];
          this.input.tableInput?.columns.forEach(item => {
            this._sortByOptions.push({ value: item.property, name: item.label });
          });
        } else {
          this._sortByOptions = [{ value: "name", name: "Subquestion" }, { value: "_columns_", name: "Response" }];
        }
      }

      // Update Table and Chart
      this.updateCard();
    }
  }
  onViewDataTypeChanged(viewDataType: ViewDataType) {
    this._viewDataType = viewDataType

    // Update Suffix symbol
    if (this.question.questionType == QuestionType.GridSingleChoise || this.question.questionType == QuestionType.GridMultipleChoise) {
      this._tableInput?.columns.forEach((column, idx) => {
        if (idx == 0)
          return;

        column.valueSuffix = (this._viewDataType == ViewDataType.Percentage ? '%' : '');
      });
    }
    else if (this.question.questionType == QuestionType.SingleChoise || this.question.questionType == QuestionType.MultipleChoise) {

      // Reset - hide all
      this._tableInput?.columns.forEach((column, idx) => {
        if (idx == 0)
          return;
        column.isToHide = true;
      });

      // just display the correct option
      this._tableInput?.columns.forEach((column, idx) => {
        if (idx == 0)
          return;

        if (this._viewDataType == ViewDataType.Count && column.property == 'count') {
          column.isToHide = false;
        }
        else if (this._viewDataType == ViewDataType.Percentage && column.property == 'percentage') {
          column.isToHide = false;
        }
      });

    }

    // Update dropdowns sort info
    if (this.question.questionType == QuestionType.SingleChoise || this.question.questionType == QuestionType.MultipleChoise) {
      this._sortByOptions = [];

      if (this._viewDataType == ViewDataType.Count)
        this._sortByOptions.push({ value: "count", name: "Count" });
      else if (this._viewDataType == ViewDataType.Percentage)
        this._sortByOptions.push({ value: "percentage", name: "Percentage" });
      this._sortByOptions.push({ value: "name", name: "Response" });
    }


    // Update Table and Chart
    this.updateCard();
  }
  onSortOptionChanged(sortOptions: any) {
    this._currentSortOptions = sortOptions;

    // Update Table and Chart
    this.updateCard();
  }
  onVisibilityChanged(options: CmiOsTableViewColumnVisibility[]) {
    this._currentVisibilityOptions = options;
    if (this.question.questionType == QuestionType.GridSingleChoise || this.question.questionType == QuestionType.GridMultipleChoise) {
      options.forEach(item => {
        // Update table
        this._tableInput?.columns.forEach(tableColumn => {
          if (tableColumn.label == item.name)
            tableColumn.isToHide = item.isHidden;
        });
      });
    }
    if (this.question.questionType == QuestionType.SingleChoise || this.question.questionType == QuestionType.MultipleChoise) {
      //console.log("cmi-os-card # onVisibilityChanged # columns => ", JSON.parse(JSON.stringify(this._tableInput?.columns)));
    }

    this.updateCard();
  }



  updateCard() {

    this._isAverage = this.isAverageQuestion();
    if (this._isAverage) {
      this._viewDataType = ViewDataType.Count;
    }
    this._tableInput = this.updateDisplayTable(this.question, this.section, this._viewDataType);

    switch (this.question.questionType) {
      case QuestionType.SingleChoise:
        this.donutChartData = this.mapDonutChartData();
        break;
      case QuestionType.MultipleChoise:
        this.barChartData = this.mapMultiQuestionBarChart();
        break;
      case QuestionType.GridMultipleChoise:
      case QuestionType.GridSingleChoise: {
        if (this.question.answers[0].subQuestions.length && !this._isAverage) {
          this.stackBarChartData = this.mapStackBarChartData();

          // Apply sort feature specific to the chart
          if (this._viewType != ViewTypes.Table) {

            this.stackBarChartColumns = [];
            this.input.tableInput?.columns.forEach((col, i) => {
              if (i == 0 || col.isToHide)
                return;

              const auxChartDataCell = this.stackBarChartData[0].chartData.find(f => f.name == col.label);
              if (auxChartDataCell) {
                // Search color info
                this.stackBarChartColumns.push({
                  name: col.label,
                  colorIndex: auxChartDataCell.colorIndex,
                  isSelected: true,
                  value: 0
                });
              }
            });

            if (this._currentSortOptions != null && this._currentSortOptions.sortColumnValue != '') {
              const tempBarChartData: StackBarChart[] = [];
              this.stackBarChartData.forEach(row => {
                const tempRow: StackBarChart =
                {
                  title: row.title,
                  isMain: row.isMain,
                  chartData: this.sort(row.chartData, 'value', this._currentSortOptions['isAscending'])
                };
                tempBarChartData.push(tempRow);
              });
              this.stackBarChartData = tempBarChartData;
            }
          }
          else if (this._viewType == ViewTypes.Table && this._currentSortOptions != null && this._currentSortOptions.sortColumnValue != '') {


            const tempBarChartData: StackBarChart[] = [];
            this.stackBarChartData.forEach(row => {
              const tempRow: StackBarChart =
              {
                title: row.title,
                isMain: row.isMain,
                chartData: this.sort(row.chartData, 'value', this._currentSortOptions['isAscending'])
              };
              tempBarChartData.push(tempRow);
            });
            this.stackBarChartData = tempBarChartData;
          }

        }
        else {
          this.barChartData = this.mapMultiQuestionBarChart();
        }
        break;
      }

      default: console.log('Unsupported question type' + this.question.questionType); break;
    }


    this.isToAggregate = this.question.questionType == QuestionType.GridMultipleChoise;
    this.updateTableToExport();
  }
  updateDisplayTable(question: ISurveyQuestion, section: SurveySection, viewDataType: ViewDataType) {

    const auxTableInput = new CmiOsTableViewInput();
    auxTableInput.htmlContainerId = 'htmltableId_' + question.id;
    auxTableInput.groupHtmlContainerId = section.htmlId;
    auxTableInput.referenceId = `chartId_${question.id}`;

    auxTableInput.messageNoData = 'No data available.';
    auxTableInput.sortField = 'order';
    auxTableInput.sortFieldOrder = 'ASC';

    auxTableInput.propertyName = 'name';
    auxTableInput.propertyCount = 'item1';
    // auxTableChartInput.propertyPercentage = 'item2';
    auxTableInput.exportName = question.value;



    const isAverage = this.isAverageQuestion();
    const hasSubQuestions = question.answers.some(answer => answer.subQuestions.length);
    const tableColumns: CmiOsTableViewColumnItem[] = [];
    const tableData: any[] = [];
    if (hasSubQuestions && !isAverage) {
      // // Check if the question has subquestions
      // if(question.answers[0].subQuestions.length>0){
      //   // Format => Answers will be the columns
      //   // Format => Subquestions will be the rows

      const dataColumns: any[] = question.answers.map(x => ({ id: x.id, value: x.value }));
      const dataRows: any[] = question.answers[0].subQuestions.map(x => ({ id: x.id, value: x.value }));


      // Api returns data duplicate per each column
      // SO we only need to use 1 answer
      const dataSource: ISurveyAnswer = question.answers[0];

      dataRows.forEach((itemRow, idxRow) => {
        const row = {} as any;
        row['name'] = itemRow.value;

        // < > Create information about columns to export
        if (idxRow == 0) {
          if (isAverage)
            tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: 'Question', isNumber: false, order: 0, isToHide: true, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));

          if (hasSubQuestions)
            tableColumns.push(new CmiOsTableViewColumnItem({ width: 'auto', property: 'name', label: 'Sub-Questions', isNumber: false, order: 0, isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: '', columnType: 0 }));
        }
        // </> Create information about columns to export


        const tempSubquestion = dataSource.subQuestions.find(x => x.id == itemRow.id);
        dataColumns.forEach((itemColumn, idxColumn) => {
          const tempAnswer = tempSubquestion?.answers.find(x => x.value == itemColumn.value);

          // < > Create information about columns to export
          if (idxRow == 0) {
            tableColumns.push(new CmiOsTableViewColumnItem({ width: (hasSubQuestions ? '15%' : 'auto'), property: 'item' + (idxColumn + 1), label: itemColumn.value, isNumber: true, order: (idxColumn + 1), isToHide: false, isToExport: true, valuePrefix: '', valueSuffix: (viewDataType == ViewDataType.Percentage && !isAverage ? '%' : ''), columnType: 0 }));

            // Use the same colors after sorting columns
            this._currentColorsOrder.push({ value: idxColumn, name: itemColumn.value });
          }
          // </> Create information about columns to export

          row['item' + (idxColumn + 1)] =
            (viewDataType == ViewDataType.Count)
              ? tempAnswer?.count
              : (viewDataType == ViewDataType.Percentage)
                ? tempAnswer?.percent
                : '';
        });

        tableData.push(row);
      });


      // Do not reset if it already exists
      auxTableInput.columns = ((this._tableInput?.columns.length ?? 0) == 0 ? tableColumns : this._tableInput?.columns) ?? [];

      // Update the columns order
      if (this._tableColumns.length > 0) {
        const tempColumnsOrdered: CmiOsTableViewColumnItem[] = [];
        this._tableColumns.forEach(column => {
          const currentColumn = this._tableInput?.columns.find(f => f.label == column.label);
          if (currentColumn)
            tempColumnsOrdered.push(currentColumn);
        });
        auxTableInput.columns = tempColumnsOrdered;
      }
      else {
        this._tableColumns = tableColumns;
      }

      auxTableInput.data = tableData;
    }
    else {

      auxTableInput.columns = JSON.parse(JSON.stringify(this.input.tableInput?.columns ?? []));
      //Update symbol if the count view is in that mode
      if (this._viewDataType == ViewDataType.Count) {
        auxTableInput.columns.forEach(column => {
          if (column.property == 'count')
            column.isToHide = false;
          if (column.property == 'percentage')
            column.isToHide = true;
        });
      }
      auxTableInput.data = JSON.parse(JSON.stringify(this.input.tableInput?.data ?? []));

      // Apply visibility options
      this._currentVisibilityOptions.forEach(option => {
        if (option['isHidden'])
          auxTableInput.data = auxTableInput.data.filter(f => f['name'] != option['name']);
      });
    }


    // STEP ### Apply Sort
    if (this._currentSortOptions) {
      const sortColumnName: string = this._currentSortOptions['sortColumnName'];
      const sortColumnValue: string = this._currentSortOptions['sortColumnValue'];
      const sortIsAscending: boolean = this._currentSortOptions['isAscending'];

      if (sortColumnValue == '_columns_') {
        let columnsToOrder: any[] = [];
        // Get columns to sort
        auxTableInput.columns.forEach((item, i) => {
          if (i > 0)
            columnsToOrder.push(item);
        });
        columnsToOrder = this.sort(columnsToOrder, 'label', sortIsAscending, true);

        const columnsOrdered: any[] = [];
        columnsOrdered.push(auxTableInput.columns[0]);
        columnsToOrder.forEach(col => {
          columnsOrdered.push(col);
        });

        // Update the columns
        auxTableInput.columns = columnsOrdered;
      }
      else {
        const isFieldText = ['Response', 'Subquestion', 'Sub-Questions'].findIndex(fi => fi == sortColumnName) > -1;
        auxTableInput.data = this.sort(auxTableInput.data, sortColumnValue, sortIsAscending, isFieldText);
      }
    }

    return auxTableInput;
  }
  updateSortAndVisibilityOptions() {

    if (this.question.questionType == "GSC" || this.question.questionType == "GMC") {
      // Update sort options
      if (this.question.questionType == QuestionType.GridMultipleChoise || this.question.questionType == QuestionType.GridSingleChoise) {
        if (this._viewType == ViewTypes.Table) {
          this._sortByOptions = [];
          this.input.tableInput?.columns.forEach(item => {
            this._sortByOptions.push({ value: item.property, name: item.label });
          });
        } else {
          this._sortByOptions = [{ value: "name", name: "Subquestion" }, { value: "_columns_", name: "Response" }];
        }
      }

      // Update visibility options
      this._visibilityOptions = this.question.answers.slice().map(x => ({
        name: x.value,
        value: x.value
      }));
    }
    else if (this.question.questionType == "SC" || this.question.questionType == "MC") {
      this._sortByOptions = [];

      if (this._viewDataType == ViewDataType.Count)
        this._sortByOptions.push({ value: "count", name: "Count" });
      else if (this._viewDataType == ViewDataType.Percentage)
        this._sortByOptions.push({ value: "percentage", name: "Percentage" });
      this._sortByOptions.push({ value: "name", name: "Response" });


      if (this.question.answers.length) {
        this._visibilityOptions = this.question.answers.map(a => ({
          name: a.value,
          value: a.value
        }));
      }
    }

  }



  mapStackBarChartData(): StackBarChart[] {
    const data: StackBarChart[] = [];

    this._tableInput?.data.forEach(row => {

      const tempChartData: StackedBarChartData[] = [];
      this._tableInput?.columns.forEach((column, idx) => {
        // Column 0 is the name, so we should avoid to consider it as column to display stackbar chart
        if (idx > 0 && !column.isToHide) {
          tempChartData.push({
            name: column.label,
            value: row[column.property],
            isSelected: false,
            colorIndex: this._currentColorsOrder.find(f => f.name == column.label)?.value ?? idx
          });
        }
      });

      const chartRow: StackBarChart = {
        title: row['name'].split('/').join(' / '),
        isMain: true,
        chartData: tempChartData
      }

      data.push(chartRow);
    });

    return data;
  }
  mapDonutChartData(): DonutChartData[] {

    const chardData: DonutChartData[] = [];

    this._tableInput?.data?.forEach((item, index) => {

      const chartItem: DonutChartData = {
        name: item.name,
        count: item.count,
        percentage: item.percentage,
        color: DountChartColors[index % DountChartColors.length],
        nestedData: [],
      };


      chardData.push(chartItem);
    });

    return chardData;
  }
  mapMultiQuestionBarChart(): BarChartData[] {
    const chardData: BarChartData[] = [];

    // this.input?.tableChartInput?.data?.filter(x => x.isMain).forEach((item) => {
    this._tableInput?.data.forEach(item => {

      const chartItem: BarChartData = {
        name: item.name ? item.name : this._isAverage ? 'Average' : item.name,
        count: item.count,
        percentage: item.percentage,
        color: '#562E76',
        isVissible: true,
        nestedData: [],
      };

      chardData.push(chartItem);
    });

    return chardData;
  }



  private isAverageQuestion(): boolean {
    const answerName = this.question.answers[0].value;
    const questionType = this.question.questionType;

    if (!questionType) {
      return answerName.toUpperCase() === 'AVERAGE';
    }

    return questionType === QuestionType.GridSingleChoise && answerName.toUpperCase() === 'AVERAGE';
  }




  updateChartToExport() {
    const columnsToExport: any[] = [];
    this.input.tableChartInput?.columns.forEach(col => {
      if (col.isToExport) {
        columnsToExport.push(new CmiOsDataExportPropertyDetail({
          propertyName: col.property,
          position: col.order + 1,
          translation: col.label
        }));
      }
    });

    // auxTableChartInput.htmlContainerId = this.input.tableChartInput.htmlContainerId + this._htmlContainerTableSuffix;
    // auxTableChartInput.groupHtmlContainerId = this.input.tableChartInput.groupHtmlContainerId;
    this.loadElementToExport(
      this.input.referenceId,
      '' + this.section.id,
      // this._htmlContainerParentPreffix + this.input.htmlContainerId,
      this.input.tableChartInput?.htmlContainerId + this._htmlContainerTableSuffix,
      this.input.title,
      this.input.exportTitle,
      this.input.tableChartInput?.data ?? [],
      columnsToExport
    );
  }
  updateTableToExport() {
    const columnsToExport: any[] = [];
    this._tableInput?.columns.forEach((col, idx) => {
      if (!col.isToHide && col.isToExport) {

        columnsToExport.push(new CmiOsDataExportPropertyDetail({
          propertyName: col.property,
          position: col.order + 1,
          translation: col.label,
          // fnTransformValue: (val: any) => { return val + (idx > 0 && this.viewDataType == ViewDataType.Percentage ? '%' : ''); }
        }));
      }
    });

    // Get data to export
    const dataToExport: any[] = [];
    this._tableInput?.data.forEach(row => {

      const tempRow: any = {};
      this._tableInput?.columns.forEach(column => {
        if (!column.isToHide && column.isToExport) {
          tempRow[column.property] = column.valuePrefix + row[column.property] + column.valueSuffix;
        }
      });

      dataToExport.push(tempRow);
    });

    this.loadElementToExport(
      this.input.referenceId,
      '' + this.section.id,
      // this._htmlContainerParentPreffix + this.input.htmlContainerId,
      this.input.tableInput?.htmlContainerId + this._htmlContainerTableSuffix,

      this.input.title,
      this.input.exportTitle,
      dataToExport,
      columnsToExport
    );

  }
  loadElementToExport(referenceId: string, groupId: string, specificExportHtmlContainerId: string, title: string, exportName: string, flatData: any[], columns: any[]) {

    const itemToExport = new CmiOsDataExportElement();
    itemToExport.id = referenceId;
    itemToExport.groupId = groupId;
    itemToExport.specificExportHtmlContainerId = specificExportHtmlContainerId;
    itemToExport.title = title;
    itemToExport.exportName = exportName;
    itemToExport.isHidden = false;
    itemToExport.type = 1;
    itemToExport.data = flatData;

    // Columns to export
    const exportPropertyDetails: CmiOsDataExportPropertyDetail[] = [];

    for (let i = 0; i < columns.length; i++) {
      exportPropertyDetails.push(new CmiOsDataExportPropertyDetail({ propertyName: columns[i].propertyName, position: columns[i].position, translation: columns[i].translation }));
    }

    let index = 1;
    exportPropertyDetails.forEach(columnItem => {
      columnItem.position = index++;
    });

    itemToExport.propertiesDetails = exportPropertyDetails;

    this.exportService.addOrUpdateElement(itemToExport);
  }
  public async onExportClick(sectionId: string) {
    this.loaderService.setCustomStatusLoading(true);
    this.exportService.onCompleteCallback(() => {
      this.loaderService.setCustomStatusLoading(false);
    });


    setTimeout(async (_: any) => {
      const exportSettings = new CmiOsDataExportSettings();
      exportSettings.groupId = sectionId;
      exportSettings.isToExportAll = false;
      exportSettings.isToGroupExcelFiles = false;
      exportSettings.formatList = ["JPG", "XLSX"];
      exportSettings.zipFilename = 'MediaVitals';
      exportSettings.maxFileNameLength = 128;

      try {
        await this.exportService.exportElements(exportSettings);

      } catch {
        this.loaderService.setCustomStatusLoading(false);
      }
    }, 100);
  }







  fnToggleViewModeClick() {
    // < > Define min height based on chart height to avoid that area blink
    const htmlParent = document.getElementById(this._htmlContainerParentPreffix + this.input.htmlContainerId);
    const htmlElement = htmlParent?.closest('.cmi-os-card-data-view');
    if (htmlElement && (this._minHeight == 0 || this._minHeight < htmlElement.clientHeight)) {
      this._minHeight = htmlElement?.clientHeight;

      (htmlElement as HTMLElement).style.minHeight = this._minHeight + "px";
    }
    // </> Define min height based on chart height to avoid that area blink

    this._isViewModeChart = this.input.isViewModeChart = !this._isViewModeChart;


    this._aggregationValues = [];

    if (this._tableInput) {
      this._tableInput.selectedCheckboxes = this._selectedCheckboxes;
    }



  }

  fnTableUpdated(info: any) {
    if (this._tableInput) {
      this._tableInput.sortField = info.sortField;
      this._tableInput.sortFieldOrder = info.sortFieldOrder;
    }

  }

  fnAggregationClear(index: number) {
    this._aggregationValues[index] = null;
    if (!(this._selectedRows[index] && Array.isArray(this._selectedRows[index]))) return;
    this._selectedRows[index].forEach((x: any) => x.isSelected = false);
    this._isRowReset++;
  }

  fnRowSelectionChanged($event: any, index: number) {
    if (!($event && Array.isArray($event) && this.input.aggregationColumnName.length)) return;

    $event.filter(x => x.hasSpecialities && x.isMain).forEach((x: any) => x.isSelected = false);

    $event = $event.filter(x => !(x.hasSpecialities && x.isMain));

    this._selectedRows[index] = $event;

    if (!this._selectedRows[index].length) {
      this._aggregationValues[index] = null;
      return
    }

    let aggregation = 0;
    $event.forEach((x: any) => aggregation += x[this.input.aggregationColumnName]);

    let tempAggregation = Number('' + this.dataFormattingService.roundNumber(aggregation));

    if (tempAggregation > 100) {
      tempAggregation = 100;
    }

    this._aggregationValues[index] = tempAggregation;
  }

  fnRowSelectionChangedTotalRows($event: any) {
    this._aggregationValues = $event;
  }

  // fnTableChartBarHorizontalUpdated(info: any) {
  //   if (this._tableChartInput) {
  //     this._tableChartInput.sortField = info.sortField;
  //     this._tableChartInput.sortFieldOrder = info.sortFieldOrder;
  //     // this.exportService.addOrUpdateElement(info);
  //   }
  // }







  public icon(layer: IChartLayerData): string {
    return layer.isVisible ? `${this._iconNamespace}:arrow_up` : `${this._iconNamespace}:arrow_down`;
  }

  public toggle(layer: IChartLayerData) {
    layer.isVisible = !layer.isVisible;
  }

  filterRowChange(row: any) {

    row.checked = !row.checked;

    // const responcePropertyName = this._multiLayersInput[0].tableChartInput.propertyName || '';

    // this._multiLayersInput.forEach(level => {
    //   level.tableChartInput.showHideResponse?.(row[responcePropertyName], !row.checked);
    // });

    // this._selectedCheckboxes[row[responcePropertyName]] = row.checked;
  }

  fnResponseCheckboxChanged($event: any) {
    this._selectedCheckboxes = $event;
  }







  sort(dataToSort: any[], field: string, isAsc: boolean = true, isFieldText = false) {
    if (isFieldText)
      return this.sortTextField(dataToSort, field, isAsc);

    return this.sortNumberField(dataToSort, field, isAsc);
  }

  sortTextField(dataToSort: any[], field: string, isAsc: boolean = true) {
    // Clone data without references
    const auxData = JSON.parse(JSON.stringify(dataToSort));
    // Save data sorted to use on create method
    let arraySorted: any[] = [];
    arraySorted = isAsc
      ? auxData.sort((a: any, b: any) => a[field].toLowerCase() < b[field].toLowerCase() ? -1 : a[field].toLowerCase() > b[field].toLowerCase() ? 1 : 0)
      : auxData.sort((a: any, b: any) => a[field].toLowerCase() < b[field].toLowerCase() ? 1 : a[field].toLowerCase() > b[field].toLowerCase() ? -1 : 0);

    return arraySorted;
  }
  sortNumberField(dataToSort: any[], field: string, isAsc: boolean = true) {
    // Clone data without references
    const auxData = JSON.parse(JSON.stringify(dataToSort));
    // Save data sorted to use on create method
    let arraySorted: any[] = [];
    arraySorted = isAsc
      ? auxData.sort((a: any, b: any) => a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0)
      : auxData.sort((a: any, b: any) => a[field] < b[field] ? 1 : a[field] > b[field] ? -1 : 0);

    return arraySorted;
  }





  private addSvgIcons() {
    this.matIconRegistry.addSvgIconInNamespace(this._iconNamespace, 'arrow_down', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/down.svg'));
    this.matIconRegistry.addSvgIconInNamespace(this._iconNamespace, 'arrow_up', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/up.svg'));
  }

  private applyDefaultCheckboxes() {
    if (!this._selectedCheckboxes) {
      return;
    }

    Object.keys(this._selectedCheckboxes).forEach(item => {
      if (!this._selectedCheckboxes[item]) {
        const row = this._filterValues.find(x => x.name == item);
        this.filterRowChange(row);
      }
    });

  }
}
