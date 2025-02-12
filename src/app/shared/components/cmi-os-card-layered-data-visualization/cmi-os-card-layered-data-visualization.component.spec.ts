import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CmiOsCardLayeredDataVisualizationComponent } from './cmi-os-card-layered-data-visualization.component';

describe('CmiOsCardLayeredDataVisualizationComponent', () => {
    let component: CmiOsCardLayeredDataVisualizationComponent;
    let fixture: ComponentFixture<CmiOsCardLayeredDataVisualizationComponent>;
    let matDialogMock: MatDialog;

    beforeEach(
        waitForAsync(() => {
            matDialogMock = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);

            TestBed.configureTestingModule({
                declarations: [CmiOsCardLayeredDataVisualizationComponent],
                providers: [{ provide: MatDialog, useValue: matDialogMock }],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CmiOsCardLayeredDataVisualizationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});