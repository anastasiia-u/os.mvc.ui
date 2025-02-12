import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CmiOsGlobalLoadingInterceptor } from '@cmi/os-library/components/cmi-os-global-loading';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AuthInterceptor } from './core/inteceptors/auth.interceptor';
import { AuthService, authServiceFactory } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';
import { TrackingQueryService } from './pages/home/components/filter/components/filter-actions/tracking-query.service';
import { OpenTrackingQueryService } from './pages/home/components/sub-navbar/open-tracking-query.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CmiOsGlobalLoadingInterceptor, multi: true },
    {
      provide: 'TrackingQueryService',
      useClass: TrackingQueryService
    },
    {
      provide: 'OpenTrackingQueryService',
      useClass: OpenTrackingQueryService
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: authServiceFactory,
      deps: [AuthService, MenuService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
