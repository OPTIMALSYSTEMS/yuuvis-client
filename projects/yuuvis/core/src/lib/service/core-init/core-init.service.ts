import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { AuthService } from '../auth/auth.service';
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
    private logger: Logger,
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService
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
    // getting a string means that we got an URL to load the config from
    return (!Array.isArray(this.coreConfig.main)
      ? of([this.coreConfig.main])
      : forkJoin(
          // TODO: what if apiWeb path is changed via config?
          [...this.coreConfig.main, ApiBase.apiWeb + '/api' + ConfigService.GLOBAL_MAIN_CONFIG].map((uri) =>
            this.http.get(`${uri.startsWith(ApiBase.apiWeb) ? '/' : Utils.getBaseHref()}${uri}`).pipe(
              catchError((e) => {
                this.logger.error('failed to catch config file', e);
                return of({});
              })
            )
          )
        )
    ).pipe(
      map((res) =>
        res
          .filter((i) => i !== null)
          .reduce((acc, x) => {
            // merge object values on 2nd level
            Object.keys(x).forEach((k) => (!acc[k] || Array.isArray(x[k]) || typeof x[k] !== 'object' ? (acc[k] = x[k]) : Object.assign(acc[k], x[k])));
            return acc;
          }, {})
      ),
      tap((res: YuvConfig) => this.configService.set(res)),
      switchMap((res: YuvConfig) => this.authService.initUser().pipe(catchError((e) => of(true))))
    );
  }
}
