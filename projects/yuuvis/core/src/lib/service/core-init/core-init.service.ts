import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { AuthService } from '../auth/auth.service';
import { YuvConfig } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { DeviceService } from '../device/device.service';
import { Logger } from '../logger/logger';

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
    private authService: AuthService
  ) {}

  initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.deviceService.init();
      this.loadConfig().subscribe(
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

    return (
      !Array.isArray(this.coreConfig.main)
        ? of([this.coreConfig.main])
        : forkJoin([...this.coreConfig.main].map((uri: string) => this.http.get(`${Utils.getBaseHref()}${uri}`).pipe(catchError(error))))
    ).pipe(
      switchMap((configs: YuvConfig[]) => this.configService.extendConfig(configs)),
      switchMap(() => this.authService.initUser().pipe(catchError((e) => of(true))))
    );
  }
}
