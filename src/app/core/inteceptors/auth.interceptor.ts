import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { configureForLocalAuth } from '../helpers/local-auth';
import { AuthService } from '../services/auth.service';

export function isLocalEnvironment(): boolean {
  return environment.production === false;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService) {
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!environment.isSaasIntegrated) {
      return next.handle(request);
    }

    if (isLocalEnvironment()) {
      request = configureForLocalAuth(request);
    }

    if (request.url.indexOf(environment.authSettings.accessTokenRoute) == -1) {
      request = request.clone({
        setHeaders: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
          'Authorization': `Bearer ${this.authService.getAccessToken}`
        }
      });
    }

    return next.handle(request);
  }
}
