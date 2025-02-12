import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CmiOsButtonModule, CmiOsCheckboxModule, CmiOsNotificationModule, CmiOsSelectModule, CmiOsToggleModule } from "@cmi/os-library/cmi-os-design-library";
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';
import { SlicerComponent } from './components/slicer/slicer.component';
import { SortDropdownsComponent } from './components/sort-dropdowns/sort-dropdowns.component';
import { StackBarChartComponent } from './components/stack-bar-chart/stack-bar-chart.component';
import { ViewConfigureComponent } from './components/view-configure/view-configure.component';
import { ViewSelectorComponent } from './components/view-selector/view-selector.component';

@NgModule({
  declarations: [
    ViewSelectorComponent,
    SlicerComponent,
    StackBarChartComponent,
    DonutChartComponent,
    SortDropdownsComponent,
    BarChartComponent,
    ViewConfigureComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CmiOsSelectModule,
    CmiOsButtonModule,
    CmiOsToggleModule,
    MatIconModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatRadioModule,
    MatTooltipModule,
    NgbTooltipModule,
    CmiOsCheckboxModule,
    CmiOsNotificationModule
  ],
  exports: [
    SlicerComponent,
    ViewSelectorComponent,
    StackBarChartComponent,
    DonutChartComponent,
    SortDropdownsComponent,
    BarChartComponent,
    ViewConfigureComponent
  ]
})
export class SharedModule { }
