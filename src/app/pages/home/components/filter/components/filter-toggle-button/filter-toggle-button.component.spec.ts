import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { FilterToggleButtonComponent } from './filter-toggle-button.component';

describe('FilterToggleButtonComponent', () => {
  let component: FilterToggleButtonComponent;
  let fixture: ComponentFixture<FilterToggleButtonComponent>;

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
});
