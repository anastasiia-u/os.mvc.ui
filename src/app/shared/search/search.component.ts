import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageModel } from '@app/core/models/page.model';
import { PaginationModel } from '@app/core/models/pagination.model';
import { SearchFilterModel } from '@app/core/models/search-filter.model';
import { SearchSurveyResult } from '@app/core/models/search-survey-result.model';
import { SurveyItem } from '@app/core/models/survey-item.model';
import { SearchService } from '@app/core/services/search.service';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  model: PaginationModel<SurveyItem>;

  isLoading = false;

  page: PageModel = new PageModel(1, 15);

  pageSizeOptions: number[] = [15, 30, 60];

  searchFilter: SearchFilterModel = new SearchFilterModel();

  searchTerm: any;

  searchTermChanged = new Subject<string>();

  activeSortColumn = 'categoryName';

  activeSortDirection: SortDirection = 'asc';

  displayedColumns: string[] = ['select', 'categoryName', 'questionName', 'subquestionName'];

  dataSource: MatTableDataSource<SurveyItem> = new MatTableDataSource();

  selection = new SelectionModel<SurveyItem>(true, []);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reportingPeriodId: number, surveyTypeId: number },
    private dialogRef: MatDialogRef<SearchComponent>,
    private searchServcie: SearchService) {
    this.model = new PaginationModel(0, []);

    this.searchTermChanged
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.selection.clear()
        this.loadData();
      })
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;


    this.sort.sortChange.subscribe((data) => {
      this.page.pageNumber = 1;
      this.paginator.pageIndex = 0;
      this.activeSortColumn = data.active;
      this.activeSortDirection = data.direction;
      this.loadData();
    });

  }

  loadData() {
    this.dataSource.data = [];

    this.isLoading = true;

    this.searchFilter.searchTerm = this.searchTerm;

    this.searchFilter.surveyTypeId = this.data.surveyTypeId;

    this.searchFilter.reportingPeriodId = this.data.reportingPeriodId;

    this.searchFilter.orderField = this.activeSortColumn;

    this.searchFilter.ascendingOrder = this.activeSortDirection === 'asc';

    this.searchServcie.searchByCategory(this.searchFilter, this.page)
      .subscribe(model => {
        this.model = model;
        this.dataSource.data = model.data
        this.isLoading = false;

        setTimeout(() => {
          this.paginator.pageIndex = this.page.pageNumber - 1; // default index is 0
          this.paginator.length = model.count;
        });
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


  isSaveButtonDisabled(): boolean {
    return !this.selection.selected.length;
  }

  clear() {
    this.searchTerm = '';
    this.page.pageNumber = 1;
    this.selection.clear();
    this.loadData();
  }

  searchData() {
    this.searchTermChanged.next(this.searchTerm);
  }

  save() {
    const response = new SearchSurveyResult();

    response.catagoryIdList = [...new Set(this.selection.selected.map(item => item.categoryId).filter(x => x > 0))];

    response.questionIdList = [...new Set(this.selection.selected.map(item => item.questionId).filter(x => x > 0))];

    response.subQuestionResponseIdList = [...new Set(this.selection.selected.map(item => item.subQuestionResponseId).filter(x => x > 0))];

    this.dialogRef.close(response);
  }

  pageChanged(event: PageEvent) {
    this.page.pageNumber = event.pageIndex + 1;
    this.page.pageSize = event.pageSize;
    this.loadData();
  }

  checked(row: any) {
    this.selection.select(row);
    return this.isChecked(row);
  }

  unChecked(row: any) {
    const found = this.selection.selected.find(x => Object.entries(x).toString() === Object.entries(row).toString());
    if (found) {
      this.selection.deselect(found);
      return true;
    }

    return false;
  }

  isChecked(row: SurveyItem): boolean {
    const found = this.selection.selected.find(x => Object.entries(x).toString() === Object.entries(row).toString());

    if (found) {
      return true;
    }

    return false;
  }
}
