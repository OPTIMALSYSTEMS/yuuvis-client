import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { AuthService } from './auth.service';
/**
 * Prevent app from running into 401 issues related to gateway timeouts.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  /**
   * @ignore
   */
  constructor(public auth: AuthService, private backend: BackendService, private oauthService: OAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
          }
        },
        error: (error: any) => {
          if (error instanceof HttpErrorResponse || error.isHttpErrorResponse) {
            if (error.status === 401) {
              if (this.backend.authUsesOpenIdConnect()) {
                // this.oauthService.initLoginFlow();
              } else {
                this.auth.logout();
              }
            }
          }
        }
      })
    );
  }
}
