import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { SearchByComponent } from './search-by.component';

describe('SearchByComponent', () => {
    let component: SearchByComponent;
    let fixture: ComponentFixture<SearchByComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SearchByComponent],
            imports: [MatDialogModule, HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();

        fixture = TestBed.createComponent(SearchByComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
