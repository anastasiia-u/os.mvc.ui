import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { CurrentSession } from '../models/current-session.model';

@Injectable({
  providedIn: 'root'
})
export class JwtHelperService {

  private readonly audience = 'aud';
  private readonly issuer = 'iss';
  private readonly expiresIn = 'exp';
  private readonly tenantNameKey = 'tenantname';
  private readonly tenantRolesKey = "tenantroles";
  private readonly departmentKey = "department";
  private readonly tenantIdKey = 'http://schemas.microsoft.com/identity/claims/tenantid';
  private readonly roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly emailAddressKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  private readonly givenNameKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
  private readonly surnameKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname';
  private readonly functions = 'functions';

  public setToken(token: string): void {
    sessionStorage.setItem('session_token', token);
  }

  public getCurrentSessionFromToken(token: string): CurrentSession {
    const sessionObject = this.decodeToken(token);
    return {
      audience: sessionObject[this.audience],
      issuer: sessionObject[this.issuer],
      expiresIn: sessionObject[this.expiresIn],
      tenantId: sessionObject[this.tenantIdKey],
      tenantName: sessionObject[this.tenantNameKey],
      roles: sessionObject[this.roleKey],
      emailAddress: sessionObject[this.emailAddressKey],
      givenName: sessionObject[this.givenNameKey],
      surname: sessionObject[this.surnameKey],
      department: sessionObject[this.departmentKey],
      tenantRoles: sessionObject[this.tenantRolesKey],
      functions: JSON.parse(sessionObject[this.functions])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private decodeToken(token: string): any {
    return jwt_decode(token);
  }
}
