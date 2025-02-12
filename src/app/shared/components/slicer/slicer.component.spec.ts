import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlicerComponent } from './slicer.component';

describe('SlicerComponent', () => {
  let component: SlicerComponent;
  let fixture: ComponentFixture<SlicerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlicerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlicerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
