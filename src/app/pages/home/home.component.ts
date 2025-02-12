import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@app/core/services/auth.service';
import { SurveyDataService } from '@app/core/services/survey-data.service';
import { ThemeService } from '@app/core/services/theme.service';
import { CmiOsGlobalLoadingService, LoaderItem, LoaderTypeValidationEnum } from '@cmi/os-library/components/cmi-os-global-loading';
import { environment } from '@env/environment';
import { MenuService } from 'src/app/core/services/menu.service';
declare let pendo: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1,
        padding: '10px'
      })),
      state('closed', style({
        height: '0px',
        opacity: 0,
        padding: '0px 10px'
      })),
      transition('open <=> closed', [
        animate('0.5s ease')
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  sideNavOpen = true;
  displayName: string = '';
  userEmail: string | null = null;
  //menuItems: MenuNode[];
  public showMenu = false;
  //public showHeader = true;
  public isSaasEnvironment = environment.isSaasIntegrated;

  updateDataVisualization: number = 0;

  expandedIndex = 0;
  isOpen = false;

  _iconNamespace = '';

  setSideNavState = ($event: any) => {
    this.sideNavOpen = $event as boolean;
  }

  constructor(
    private loaderService: CmiOsGlobalLoadingService,
    readonly authService: AuthService,
    public themeService: ThemeService,
    private surveyDataService: SurveyDataService,
    private menuService: MenuService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,) {
    this.initGlobalLoading();
    this.addSvgIcons();
  }

  private addSvgIcons() {
    this.matIconRegistry.addSvgIconInNamespace(this._iconNamespace, 'menu-down', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/menu-down.svg'));
  }

  // @HostListener('document:click', ['$event']) onClick(e: Event): void {
  //   if (this.showHeader) {
  //     if (e.target !== this.menuButton.nativeElement && !this.menu?.nativeElement.contains(e.target)) {
  //       this.showMenu = false;
  //     }
  //   }
  // }

  ngOnInit(): void {
    if (environment.isSaasIntegrated) {
      this.displayName = this.authService.getDisplayName();
      this.userEmail = this.authService.getUserSession.emailAddress;
    } else {
      this.displayName = 'Carol Smithson';
    }

    // TODO
    // if (window.location.hostname.indexOf('wpp') >= 0) {
    //   this.showHeader = false
    // }

    pendo.initialize({
      visitor: {
        id: this.authService.getUserSession.emailAddress,
        email: this.authService.getUserSession.emailAddress,
        firstName: this.authService.userFirstName(),
        lastName: this.authService.userLastName(),
        tenantId: this.authService.getCurrentTenantId,
        tenantName: this.authService.getTenantName(),
        tenantType: this.authService.getTenantRoles,
        department: this.authService.getUserDepartment
      },
      account: {
        id: "SAAS " + environment.environmentName,
        accountName: "OS Empower"
      }
    });

    // this.menuItems = this.menuService.menu;
  }

  onOpenedAudience() {
    this.updateDataVisualization++;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // @ViewChild('menuButton') menuButton: ElementRef;
  // @ViewChild('menu') menu: ElementRef;

  getRouter(application: string) {
    return `${window.location.origin}/${application}`;
  }

  getResourceLibraryUrl() {
    return 'https://cmicompas.egnyte.com/app/index.do#storage/files/1/Shared/Documents/Empower%20Reference%20Library/NEW%20OS%20REFERENCE%20CENTER/NEW%20OS-%20Syndicated%20Research%20RESOURCE%20CENTER';
  }

  private initGlobalLoading() {
    this.loaderService.clearUrlLimitations();
    const aux = [
      new LoaderItem({ url: 'survey/results', type: LoaderTypeValidationEnum.EndsWith }),
      new LoaderItem({ url: 'sub-questions-responses', type: LoaderTypeValidationEnum.EndsWith }),
      new LoaderItem({ url: 'questions', type: LoaderTypeValidationEnum.EndsWith }),
      new LoaderItem({ url: 'reporting-periods', type: LoaderTypeValidationEnum.Contains }),
    ];
    aux.forEach(f => {
      this.loaderService.addUrlLimitations(f);
    });
  }
}
