import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { AuthService } from '../auth/auth.service';
import { OpenIdConfig } from '../backend/backend.interface';
import { BackendService } from '../backend/backend.service';
import { YuvConfig } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { DeviceService } from '../device/device.service';
import { Logger } from '../logger/logger';
import { ApiBase } from './../backend/api.enum';

/**
 * Providing functions,that are are injected at application startup and executed during app initialization.
 */
@Injectable({
  providedIn: 'root'
})
export class CoreInit {
  /**
   * @ignore
   */
  constructor(
    @Inject(CORE_CONFIG) private coreConfig: CoreConfig,
    private deviceService: DeviceService,
    private backend: BackendService,
    private logger: Logger,
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    private oauthService: OAuthService
  ) {}

  initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.deviceService.init();
      this.loadConfig()
        .pipe(switchMap(() => this.authService.init()))
        .subscribe(
          (res) => resolve(true),
          (err) => {
            this.logger.error(err);
            reject();
          }
        );
    });
  }

  private loadConfig() {
    const error = (e) => {
      this.logger.error('failed to catch config file', e);
      return of({});
    };

    let openIdConfig: OpenIdConfig;
    let httpOptions;
    return this.loadOIDC().pipe(
      switchMap((oidc: OpenIdConfig) => {
        openIdConfig = oidc;
        httpOptions = oidc
          ? {
              headers: { 'X-ID-TENANT-NAME': openIdConfig.tenant }
            }
          : null;
        return (
          !Array.isArray(this.coreConfig.main)
            ? of([this.coreConfig.main])
            : forkJoin(
                [...this.coreConfig.main].map((uri: string) =>
                  this.http.get(`${oidc && uri.indexOf('assets/') === -1 ? oidc.host : Utils.getBaseHref()}${uri}`, httpOptions).pipe(catchError(error))
                )
              ).pipe(
                switchMap((configs: YuvConfig[]) =>
                  this.http
                    .get(
                      `${openIdConfig ? openIdConfig.host : ''}${configs.reduce((p, c) => (c?.core?.apiBase ? c?.core?.apiBase[ApiBase.apiWeb] || p : p), '')}${
                        ConfigService.GLOBAL_MAIN_CONFIG
                      }`,
                      httpOptions
                    )
                    .pipe(
                      catchError(error),
                      map((global) => [...configs, global])
                    )
                )
              )
        ).pipe(
          map((res) =>
            res.reduce((acc, x) => {
              // merge object values on 2nd level
              Object.keys(x || {}).forEach((k) => (!acc[k] || Array.isArray(x[k]) || typeof x[k] !== 'object' ? (acc[k] = x[k]) : Object.assign(acc[k], x[k])));
              return acc;
            }, {})
          ),
          tap((res: YuvConfig) => this.configService.set(res)),
          switchMap((res: YuvConfig) => this.authService.initUser().pipe(catchError((e) => of(true))))
        );
      })
    );
  }

  private loadOIDC(): Observable<OpenIdConfig> {
    const uri = 'assets/oidc.json';
    return this.http.get(`${Utils.getBaseHref()}${uri}`).pipe(
      catchError((_) => of(null)),
      switchMap((oidc: OpenIdConfig) => (oidc ? this.initOpenIdConnect(oidc) : of(null)))
    );
  }

  private initOpenIdConnect(oidc: OpenIdConfig): Observable<OpenIdConfig> {
    if (oidc) {
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
    } else {
      return of(null);
    }
  }
}
