import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CmiOsCardLayeredDataVisualizationComponent } from './cmi-os-card-layered-data-visualization.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { CmiOsTableViewModule } from '@cmi/os-library/components/cmi-os-table-view';
import { SharedModule } from "../../shared.module";

@NgModule({
    declarations: [
        CmiOsCardLayeredDataVisualizationComponent
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        CmiOsTableViewModule,
        SharedModule
    ],
    exports: [
        CmiOsCardLayeredDataVisualizationComponent
    ]
})
export class CmiOsCardLayeredDataVisualizationModule { }