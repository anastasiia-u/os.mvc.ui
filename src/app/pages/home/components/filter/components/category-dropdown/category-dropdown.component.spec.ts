import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryDropdownComponent } from './category-dropdown.component';
import { FilterService } from '@app/core/services/filter.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { of, Subject } from 'rxjs';
import { CmiOsDropdownSimpleComponent } from '@cmi/os-library/components/cmi-os-dropdown-simple';

describe('CategoryDropdownComponent', () => {
  let component: CategoryDropdownComponent;
  let fixture: ComponentFixture<CategoryDropdownComponent>;
  let filterService: jasmine.SpyObj<FilterService>;
  let surveyDataService: jasmine.SpyObj<SurveyDataService>;

  beforeEach(async () => {
    const filterServiceSpy = jasmine.createSpyObj('FilterService', ['loadCategoriesByReportingPeriod']);
    const surveyDataServiceSpy = jasmine.createSpyObj('SurveyDataService', [], {
      reportingPeriodId$: new Subject<number>(),
      categoryIds$: new Subject<number[]>(),
      surveyTypeId$: { value: 1 }
    });

    await TestBed.configureTestingModule({
      declarations: [CategoryDropdownComponent, CmiOsDropdownSimpleComponent],
      imports: [
        HttpClientModule
      ],
      providers: [
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: SurveyDataService, useValue: surveyDataServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryDropdownComponent);
    component = fixture.componentInstance;
    filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;
    surveyDataService = TestBed.inject(SurveyDataService) as jasmine.SpyObj<SurveyDataService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to reportingPeriodId$ on init', () => {
    spyOn(component, 'updateCategories');
    surveyDataService.reportingPeriodId$.next(1);
    expect(component.updateCategories).toHaveBeenCalledWith(1);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should update categories and call categoriesChanged', () => {
    const mockCategories: Category[] = [{ id: 1, name: 'Category 1' }];
    filterService.loadCategoriesByReportingPeriod.and.returnValue(of(mockCategories));
    spyOn(component, 'categoriesChanged');
    spyOn(component, 'dataLoaded');

    component.updateCategories(1);

    expect(filterService.loadCategoriesByReportingPeriod).toHaveBeenCalled();
    expect(component.categories).toEqual(mockCategories);
    expect(component.categoriesChanged).toHaveBeenCalledWith([]);
    expect(component.dataLoaded).toHaveBeenCalled();
  });

  it('should reset categories', () => {
    spyOn(component, 'categoriesChanged');
    component.reset();
    expect(component.categoriesChanged).toHaveBeenCalledWith([]);
  });

  it('should change categories', () => {
    const ids = [1, 2, 3];
    component.categoriesChanged(ids);
    expect(component.defaultCategories).toEqual(ids);
    expect(surveyDataService.categoryIds$.next).toHaveBeenCalledWith(ids);
  });

  it('should not update categories if selectedReportingPeriodId is falsy', () => {
    spyOn(component, 'categoriesChanged');
    component.updateCategories(0);
    expect(component.categoriesChanged).not.toHaveBeenCalled();
  });

  it('should toggle all categories off if catFilter is present', () => {
    component.catFilter = jasmine.createSpyObj('CmiOsDropdownSimpleComponent', ['toggleAll']);
    component.updateCategories(1);
    expect(component.catFilter.toggleAll).toHaveBeenCalledWith(false);
  });
});