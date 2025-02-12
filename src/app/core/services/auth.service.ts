import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddAccess, DeleteAccess, ReadAccess, WriteAccess } from '../constants/permission.settings';
import { CurrentSession } from '../models/current-session.model';
import { UserFunctions } from '../models/permission.model';
import { Roles } from '../models/roles.model';
import { TenantThemeModel } from '../models/tenant-theme.model';
import { TokenResponseModel } from '../models/token-response.model';
import { JwtHelperService } from './jwt-helper.service';
import { MenuService } from './menu.service';
import { ThemeService } from './theme.service';

export const authServiceFactory = (authService: AuthService, menuService: MenuService) => {
  return () => authService.loadUserSession()
    .then(
      () => menuService.loadMenu()
    );
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private accessToken = '';
  private readonly initialSession: CurrentSession =
    {
      audience: '',
      emailAddress: '',
      expiresIn: 0,
      givenName: '',
      tenantName: '',
      issuer: '',
      roles: [],
      surname: '',
      tenantId: '',
      tenantRoles: '',
      department: '',
      functions: []
    };

  private readonly currentSession = new BehaviorSubject<CurrentSession>(this.initialSession);
  private readonly currentSession$ = this.currentSession.asObservable().pipe(
    filter(resp => !!resp)
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly jwtHelperService: JwtHelperService,
    private permissionService: NgxPermissionsService,
    private themeService: ThemeService) {
  }

  public get getAccessToken(): string {
    return this.accessToken;
  }

  public get getUserSession(): CurrentSession {
    return this.currentSession.value;
  }

  public get getCurrentTenantId(): string {
    return this.currentSession.value.tenantId;
  }

  get getTenantRoles(): string {
    return this.currentSession.value.tenantRoles;
  }

  get getUserDepartment(): string {
    return this.currentSession.value.department;
  }

  public get getCurrentRole(): string[] {
    return this.currentSession.value.roles;
  }

  get getCurrentRoleWithoutPermissionRoles(): string[] {
    let userRoles: string[] = this.currentSession.value.roles as string[];
    if (typeof userRoles === 'string' || userRoles instanceof String) {
      return userRoles;
    } else {
      return userRoles.filter(c => c == Roles.TenantAdmin || c == Roles.User || c == Roles.SaasAdmin);
    }
  }

  public loadUserSession(): Promise<boolean> {
    if (!environment.isSaasIntegrated) {
      return new Promise((resolve) => {

        // hardcode permissions for not isSaasIntegrated services
        const permissions = [
          'readaccessToModule',
          'readnpiSelection',
          'readamaSelection',
          'readtargetListSelection',
          'readcmiSelection',
          'readmanageHcpInsights',
          'writemanageHcpInsights'
        ];

        this.permissionService.addPermission(permissions);

        resolve(true);
      });
    }

    return new Promise<boolean>((resolve, reject) => {
      this.loadToken().subscribe({
        next: async resp => {

          this.accessToken = resp.access_token;

          const data = this.jwtHelperService.getCurrentSessionFromToken(this.accessToken);

          this.currentSession.next(data);

          const theme = await this.loadTenantTheme(data.tenantId);

          this.themeService.applyTheme(theme);

          this.addPermissions(data.functions);

          resolve(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          resolve(true); // will redirect to error page due to empty permissions
        }
      })
    })
  }

  public logout() { // TODO
    this.permissionService.flushPermissions();
  }

  public getDisplayName(): string {
    return this.currentSession.value.givenName + ' ' + this.currentSession.value.surname;
  }

  public getTenantName(): string {
    return this.currentSession.value.tenantName;
  }

  public userFirstName(): string {
    return (
      this.currentSession.value.givenName
    );
  }

  public userLastName(): string {
    return (
      this.currentSession.value.surname
    );
  }

  private async loadTenantTheme(tenantId: string) {
    try {
      const theme = await firstValueFrom(this.httpClient.get<TenantThemeModel>(`/api/tenant/customization/${tenantId}`));
      return theme;
    } catch (ex) {
      console.log('load tenant/customization error: ' + ex);
      return null;
    }
  }

  private addPermissions(functions: UserFunctions[]) {
    const permissions: string[] = [];

    functions.forEach((item: UserFunctions) => {
      if (item.read) {
        permissions.push(`${ReadAccess}${item.functionName}`);
      }

      if (item.write) {
        permissions.push(`${WriteAccess}${item.functionName}`);
      }

      if (item.add) {
        permissions.push(`${AddAccess}${item.functionName}`);
      }

      if (item.delete) {
        permissions.push(`${DeleteAccess}${item.functionName}`);
      }
    });

    this.permissionService.flushPermissions();
    this.permissionService.addPermission(permissions);
  }

  private loadToken(): Observable<TokenResponseModel> {
    const authSettings = environment.authSettings;
    const url = `${authSettings.authApiBaseUrl}${authSettings.accessTokenRoute}`;

    return this.httpClient.get<TokenResponseModel>(url, {
      headers: {
        [authSettings.productNameHeader]: authSettings.productName
      }
    });
  }
}
