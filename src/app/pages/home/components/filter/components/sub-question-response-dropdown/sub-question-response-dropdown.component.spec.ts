import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubQuestionResponseDropdownComponent } from './sub-question-response-dropdown.component';

describe('SubQuestionResponseDropdownComponent', () => {
    let component: SubQuestionResponseDropdownComponent;
    let fixture: ComponentFixture<SubQuestionResponseDropdownComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SubQuestionResponseDropdownComponent],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();

        fixture = TestBed.createComponent(SubQuestionResponseDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});