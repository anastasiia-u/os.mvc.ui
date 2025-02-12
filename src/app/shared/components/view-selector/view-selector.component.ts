import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ViewSelectorOption, ViewTypes } from "./view-types";

@Component({
    selector: 'app-view-selector',
    templateUrl: './view-selector.component.html',
    styleUrls: ['./view-selector.component.scss']
})
export class ViewSelectorComponent implements OnInit, OnChanges {
    @Input() public viewOptions!: ViewSelectorOption[];

    @Output()
    onViewModeChanged: EventEmitter<ViewTypes> = new EventEmitter();

    public viewTypesEnum = ViewTypes;

    constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {

    }

    ngOnInit(): void {
        this.iconRegistry.addSvgIcon(
            "bar-chart-icon",
            this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/bar-chart-icon.svg`)
        );
        this.iconRegistry.addSvgIcon(
            "pie-chart-icon",
            this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/pie-chart-icon.svg`)
        );
        this.iconRegistry.addSvgIcon(
            "table-icon",
            this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/table-icon.svg`)
        );
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    onViewSelected(viewType: ViewTypes) {
        const currentElement = this.viewOptions.find(x => x.viewType == viewType);
        if (!currentElement) return;
        currentElement.isActive = true;
        const oldElement = this.viewOptions.find(x => x.viewType !== viewType);
        if (!oldElement) return;
        oldElement.isActive = false;

        this.onViewModeChanged.emit(currentElement.viewType);
    }
}