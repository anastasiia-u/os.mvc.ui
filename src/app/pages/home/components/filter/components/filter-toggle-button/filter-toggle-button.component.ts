import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-filter-toggle-button',
  templateUrl: './filter-toggle-button.component.html',
  styleUrls: ['./filter-toggle-button.component.scss']
})
export class FilterToggleButtonComponent {
  @Input()
  sideNavOpen = true;

  @Output()
  sidebarState: EventEmitter<void> = new EventEmitter();

  _iconNamespace = 'filterSection';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.addSvgIcons();
  }

  get icon(): string {
    return this.sideNavOpen ? `${this._iconNamespace}:arrow_back` : `${this._iconNamespace}:arrow_forward`;
  }

  toggleFilterSection = (): void => {
    this.sidebarState.emit();
  };

  private addSvgIcons() {
    this.matIconRegistry.addSvgIconInNamespace(this._iconNamespace, 'arrow_back', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/left.svg'));
    this.matIconRegistry.addSvgIconInNamespace(this._iconNamespace, 'arrow_forward', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/right.svg'));
  }
}
