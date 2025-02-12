import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmiOsDropdownSimpleComponent2 } from './cmi-os-dropdown-simple2.component';

describe('CmiOsDropdownSimpleComponent2', () => {
  let component: CmiOsDropdownSimpleComponent2;
  let fixture: ComponentFixture<CmiOsDropdownSimpleComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CmiOsDropdownSimpleComponent2]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CmiOsDropdownSimpleComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
