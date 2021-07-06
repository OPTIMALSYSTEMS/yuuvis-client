import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { AuthConfig, OAuthModuleConfig, OAuthService } from 'angular-oauth2-oidc';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { OpenIdConfig } from '../backend/backend.interface';
import { BackendService } from '../backend/backend.service';

@Injectable({
  providedIn: 'root'
})
export class OidcService {
  constructor(
    // @Inject(OAuthModuleConfig) private oAuthConfig: OAuthModuleConfig,
    @Optional() private oAuthConfig: OAuthModuleConfig,
    private http: HttpClient,
    private backend: BackendService,
    private oauthService: OAuthService
  ) {}

  checkForOIDCConfig(): Observable<OpenIdConfig> {
    const uri = 'assets/oidc.json';
    return this.http.get(`${Utils.getBaseHref()}${uri}`).pipe(
      catchError((_) => of(null)),
      switchMap((oidc: OpenIdConfig) => (oidc ? this.initOpenIdConnect(oidc) : of(null)))
    );
  }

  private initOpenIdConnect(oidc: OpenIdConfig): Observable<OpenIdConfig> {
    this.oAuthConfig.resourceServer = {
      sendAccessToken: true,
      allowedUrls: [oidc.host]
    };

    const authConfig: AuthConfig = {
      issuer: oidc.issuer,
      redirectUri: oidc.redirectUri || window.location.origin + '/',
      postLogoutRedirectUri: oidc.postLogoutRedirectUri || window.location.origin + '/login',
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
    return from(this.oauthService.loadDiscoveryDocumentAndLogin()).pipe(
      map((_) => {
        if (oidc.host.endsWith('/')) {
          oidc.host = oidc.host.substring(0, oidc.host.length - 1);
        }
        this.backend.setOIDC(oidc);
        return oidc;
      })
    );
  }
}
