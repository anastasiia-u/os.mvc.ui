import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FilterToggleButtonComponent } from './filter-toggle-button.component';

describe('FilterToggleButtonComponent', () => {
  let component: FilterToggleButtonComponent;
  let fixture: ComponentFixture<FilterToggleButtonComponent>;
  let matIconRegistry: MatIconRegistry;
  let domSanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterToggleButtonComponent],
      imports: [
        MatIconModule,
        HttpClientModule
      ],
      providers: [MatIconRegistry],
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilterToggleButtonComponent);
    component = fixture.componentInstance;
    matIconRegistry = TestBed.inject(MatIconRegistry);
    domSanitizer = TestBed.inject(DomSanitizer);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit sidebarState on click', () => {
    spyOn(component.sidebarState, 'emit');

    component.toggleFilterSection();

    expect(component.sidebarState.emit).toHaveBeenCalled();
  });

  it('should return correct icon when sideNavOpen is true', () => {
    component.sideNavOpen = true;
    expect(component.icon).toBe('filterSection:arrow_back');
  });

  it('should return correct icon when sideNavOpen is false', () => {
    component.sideNavOpen = false;
    expect(component.icon).toBe('filterSection:arrow_forward');
  });

  it('should add SVG icons on initialization', () => {
    spyOn(matIconRegistry, 'addSvgIconInNamespace');
    component.ngOnInit();
    expect(matIconRegistry.addSvgIconInNamespace).toHaveBeenCalledWith('filterSection', 'arrow_back', domSanitizer.bypassSecurityTrustResourceUrl('assets/images/left.svg'));
    expect(matIconRegistry.addSvgIconInNamespace).toHaveBeenCalledWith('filterSection', 'arrow_forward', domSanitizer.bypassSecurityTrustResourceUrl('assets/images/right.svg'));
  });
});
