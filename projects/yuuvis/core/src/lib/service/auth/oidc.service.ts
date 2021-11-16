import { Inject, Injectable, Optional } from '@angular/core';
import { AuthConfig, OAuthModuleConfig, OAuthService } from 'angular-oauth2-oidc';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenIdConfig } from '../backend/backend.interface';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';

@Injectable({
  providedIn: 'root'
})
export class OidcService {
  constructor(@Optional() private oAuthConfig: OAuthModuleConfig, @Inject(CORE_CONFIG) public config: CoreConfig, private oauthService: OAuthService) {}

  initOpenIdConnect(oidc: OpenIdConfig): Observable<OpenIdConfig> {
    oidc = this.config.oidc = oidc || this.config.oidc;
    if (oidc?.host) {
      oidc.host = oidc.host.endsWith('/') ? oidc.host.substring(0, -1) : oidc.host;
    } else return of(null);

    this.oAuthConfig.resourceServer = {
      sendAccessToken: true,
      allowedUrls: [oidc.host]
    };

    const authConfig: AuthConfig = {
      strictDiscoveryDocumentValidation: false,
      issuer: oidc.issuer,
      redirectUri: oidc.redirectUri || window.location.origin + '/',
      postLogoutRedirectUri: oidc.postLogoutRedirectUri || window.location.origin + '/',
      clientId: oidc.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      showDebugInformation: false,
      requireHttps: false,
      disableAtHashCheck: true,
      sessionCheckIntervall: 60000,
      sessionChecksEnabled: true,
      clearHashAfterLogin: false,
      silentRefreshTimeout: 5000 // For faster testing
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    return from(this.oauthService.loadDiscoveryDocumentAndLogin()).pipe(map(() => this.config.oidc));
  }

  logout() {
    this.oauthService.logOut();
  }

  setupCookie(viewer: string, path: string, headers: any) {
    return new Observable((subscriber) => {
      let iframe: any = document.querySelector('body > iframe#__oidc') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.id = '__oidc';
        iframe.onload = () => {
          iframe.subscriber.next({});
          iframe.subscriber.complete();
        };
      }

      iframe.subscriber = subscriber;

      iframe.setAttribute('src', `${viewer}/download?setCookie=/&path=${encodeURIComponent(path)}&headers=${encodeURIComponent(JSON.stringify(headers))}`);
      document.body.appendChild(iframe);
    });
  }
}
