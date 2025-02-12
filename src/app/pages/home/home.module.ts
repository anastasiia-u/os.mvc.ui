import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { CmiOsCardLayeredDataVisualizationModule } from '@app/shared/components/cmi-os-card-layered-data-visualization/cmi-os-card-layered-data-visualization.module';
import { CmiOsDropdownSimpleModule2 } from '@app/shared/components/cmi-os-dropdown-simple2/cmi-os-dropdown-simple2.module';
import { SearchModule } from '@app/shared/search/search.module';
import { CmiOsAgreementCheckerModule, CmiOsBannerTopModule, CmiOsButtonModule, CmiOsHelpButtonModule } from '@cmi/os-library/cmi-os-design-library';
import { CmiOsCardDataVisualizationModule } from '@cmi/os-library/components/cmi-os-card-data-visualization';
import { CmiOsDropdownGroupModule } from '@cmi/os-library/components/cmi-os-dropdown-group';
import { CmiOsDropdownGroupLayeredModule } from '@cmi/os-library/components/cmi-os-dropdown-group-layered';
import { CmiOsDropdownSimpleModule } from '@cmi/os-library/components/cmi-os-dropdown-simple';
import { CmiOsFilterTypeModule } from '@cmi/os-library/components/cmi-os-filter-type';
import { CmiOsFilterTypeDialogModule } from '@cmi/os-library/components/cmi-os-filter-type-dialog';
import { CmiOsGlobalLoadingModule } from '@cmi/os-library/components/cmi-os-global-loading';
import { CmiOsNavbarModule } from '@cmi/os-library/components/cmi-os-navbar';
import { CmiOsOpenSurveyQueryModule } from '@cmi/os-library/services/cmi-os-open-survey-query';
import { CmiOsSaveSurveyQueryModule } from '@cmi/os-library/services/cmi-os-save-survey-query';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from 'src/app/shared/shared.module';
import { DataVisualizationComponent } from './components/data-visualization/data-visualization.component';
import { CategoryDropdownComponent } from './components/filter/components/category-dropdown/category-dropdown.component';
import { FilterActionsComponent } from './components/filter/components/filter-actions/filter-actions.component';
import { FilterToggleButtonComponent } from './components/filter/components/filter-toggle-button/filter-toggle-button.component';
import { FilterTypeComponent } from './components/filter/components/filter-type/filter-type.component';
import { QuestionDropdownComponent } from './components/filter/components/question-dropdown/question-dropdown.component';
import { ReportingPeriodDropdownComponent } from './components/filter/components/reporting-period-dropdown/reporting-period-dropdown.component';
import { SearchByComponent } from './components/filter/components/search-by/search-by.component';
import { SpecialtyDropdownComponent } from './components/filter/components/specialty-dropdown/specialty-dropdown.component';
import { SubQuestionResponseDropdownComponent } from './components/filter/components/sub-question-response-dropdown/sub-question-response-dropdown.component';
import { SurveyTypeDropdownComponent } from './components/filter/components/survey-type-dropdown/survey-type-dropdown.component';
import { FilterComponent } from './components/filter/filter.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { SubNavbarComponent } from './components/sub-navbar/sub-navbar.component';
import { SurveyNavbarComponent } from './components/survey-navbar/survey-navbar.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';


@NgModule({
  declarations: [
    HomeComponent,
    FilterComponent,
    FilterToggleButtonComponent,
    ReportingPeriodDropdownComponent,
    CategoryDropdownComponent,
    QuestionDropdownComponent,
    SpecialtyDropdownComponent,
    FilterTypeComponent,
    FilterActionsComponent,
    DataVisualizationComponent,
    SurveyNavbarComponent,
    SubQuestionResponseDropdownComponent,
    SubNavbarComponent,
    SearchByComponent,
    SurveyTypeDropdownComponent,
    SideMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    CdkAccordionModule,
    MatExpansionModule,
    CmiOsNavbarModule,
    CmiOsDropdownSimpleModule,
    CmiOsDropdownSimpleModule2,
    CmiOsFilterTypeModule,
    CmiOsCardDataVisualizationModule,
    CmiOsDropdownGroupModule,
    CmiOsDropdownGroupLayeredModule,
    CmiOsGlobalLoadingModule,
    CmiOsFilterTypeDialogModule,
    CmiOsHelpButtonModule,
    CmiOsBannerTopModule,
    CmiOsAgreementCheckerModule,
    CmiOsButtonModule,

    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatDialogModule,
    MatTreeModule,

    SearchModule,
    CmiOsCardLayeredDataVisualizationModule,
    CmiOsSaveSurveyQueryModule,
    CmiOsOpenSurveyQueryModule,
    NgxPermissionsModule.forChild(),
    NgbDropdownModule,
    MatTooltipModule
  ]
})
export class HomeModule { }
