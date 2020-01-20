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
import { ScreenService } from '../screen/screen.service';

@Injectable({
  providedIn: 'root'
})
export class CoreInit {
  constructor(
    @Inject(CORE_CONFIG) private coreConfig: CoreConfig,
    // DO NOT REMOVE: Otherwise service will not kick in until referenced
    private screenService: ScreenService,
    private deviceService: DeviceService,
    private logger: Logger,
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService
  ) {}

  initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.deviceService.init();

      /**
       * getting a string means that we got an URL to load the config from
       */
      let config = !Array.isArray(this.coreConfig.main)
        ? of([this.coreConfig.main])
        : forkJoin(
            this.coreConfig.main.map(c =>
              this.http.get(`${Utils.getBaseHref(true)}${c}`).pipe(
                catchError(e => {
                  this.logger.error('failed to catch config file', e);
                  return of({});
                })
              )
            )
          );

      config
        .pipe(
          map(res =>
            res.reduce((acc, x) => {
              // merge object values on 2nd level
              Object.keys(x).forEach(k => (!acc[k] || Array.isArray(x[k]) || typeof x[k] !== 'object' ? (acc[k] = x[k]) : Object.assign(acc[k], x[k])));
              return acc;
            }, {})
          ),
          tap((res: YuvConfig) => this.configService.set(res)),
          switchMap((res: YuvConfig) => {
            return this.authService.initUser().pipe(
              tap(x => console.log(x)),
              catchError(e => {
                return of(true);
              })
            );
          })
          //tap(res => console.log(res))
        )
        .subscribe(
          res => {
            resolve(true);
          },
          err => {
            this.logger.error(err);
            reject();
          }
        );
    });
  }
}
