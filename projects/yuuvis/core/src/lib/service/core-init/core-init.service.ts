import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { AuthService } from '../auth/auth.service';
import { OidcService } from '../auth/oidc.service';
import { OpenIdConfig } from '../backend/backend.interface';
import { YuvConfig } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { DeviceService } from '../device/device.service';
import { Logger } from '../logger/logger';
import { TENANT_HEADER } from '../system/system.enum';
import { ApiBase } from './../backend/api.enum';

/**
 * Providing functions,that are are injected at application startup and executed during app initialization.
 */
@Injectable()
export class CoreInit {
  /**
   * @ignore
   */
  constructor(
    @Inject(CORE_CONFIG) private coreConfig: CoreConfig,
    private deviceService: DeviceService,
    private logger: Logger,
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    private oidcService: OidcService
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
    return this.oidcService.checkForOIDCConfig().pipe(
      switchMap((oidc: OpenIdConfig) => {
        openIdConfig = oidc;
        if (oidc) {
          const headers = {};
          headers[TENANT_HEADER] = openIdConfig.tenant;
          httpOptions = { headers };
        }
        return (
          !Array.isArray(this.coreConfig.main)
            ? of([this.coreConfig.main])
            : forkJoin(
                [...this.coreConfig.main].map((uri: string) =>
                  this.http.get(`${oidc && uri.indexOf('assets/') === -1 ? oidc.host : Utils.getBaseHref()}${uri}`, httpOptions).pipe(catchError(error))
                )
              ).pipe(
                switchMap((configs: YuvConfig[]) => {
                  const uri = `${openIdConfig ? openIdConfig.host : ''}${configs.reduce(
                    (p, c) => (c?.core?.apiBase ? c?.core?.apiBase[ApiBase.apiWeb] || p : p),
                    ''
                  )}${ConfigService.GLOBAL_MAIN_CONFIG}`;
                  return this.http.get(uri, httpOptions).pipe(
                    catchError(error),
                    map((global) => [...configs, global])
                  );
                })
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
}
