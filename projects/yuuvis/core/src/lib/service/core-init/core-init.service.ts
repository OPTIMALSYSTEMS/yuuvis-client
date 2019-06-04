import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, forkJoin } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Logger } from '../logger/logger';
import { ConfigService } from '../config/config.service';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { CoreConfig } from '../config/core-config';
import { AuthService } from '../auth/auth.service';
import { YuvConfig } from '../config/config.interface';
import { ScreenService } from '../screen/screen.service';

@Injectable({
  providedIn: 'root'
})
export class CoreInit {

  constructor(@Inject(CORE_CONFIG) private coreConfig: CoreConfig,
  // DO NOT REMOVE: Otherwise service will not kcik in until referenced  
  private screenService: ScreenService,
    private logger: Logger,
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService) { }

  initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      /**
       * getting a string means that we got an URL to load the config from
       */
      let config = !Array.isArray(this.coreConfig.main) ? of([this.coreConfig.main]) :
        forkJoin(this.coreConfig.main.map(c => this.http.get(c).pipe(
          catchError(e => {
            this.logger.error('failed to catch config file', e);
            return of({});
          })
        )));

      config.pipe(
        map((res) => res.reduce((acc, x) => {
          // merge object values on 2nd level
          Object.keys(x).forEach(k => !acc[k] || Array.isArray(x[k]) || typeof x[k] !== 'object' ? acc[k] = x[k] : Object.assign(acc[k], x[k]));
          return acc;
        }, {})
        ),
        mergeMap((res: YuvConfig) => {
          this.configService.set(res);
          return this.authService.initUser()
            .pipe(catchError(e => of(true)));
        })
      ).subscribe(res => {
        resolve(true);
      }, err => {
        this.logger.error(err);
        reject();
      });
    });
  }
}
