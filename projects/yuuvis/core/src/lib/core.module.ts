import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { YuvCoreSharedModule } from './core.shared.module';
import { AuthInterceptor } from './service/auth/auth.interceptor';
import { CoreConfig } from './service/config/core-config';
import { CORE_CONFIG, CUSTOM_CONFIG } from './service/config/core-config.tokens';
import { OfflineInterceptor } from './service/connection/offline.interceptor';
import { CoreInit } from './service/core-init/core-init.service';
import { EoxMissingTranslationHandler } from './service/core-init/missing-translation-handler';
import { EoxTranslateJsonLoader } from './service/core-init/translate-json-loader';
import { Logger } from './service/logger/logger';
import { LoggerConsoleService } from './service/logger/logger-console.service';

export function init_module(coreInit: CoreInit) {
  // Need to set to a const before returning due to:
  // @see: https://github.com/angular/angular/issues/14485
  const fnc: Function = () => {
    return coreInit.initialize();
  };
  return fnc;
}

/**
 * `YuvCoreModule` provides a bunch of services to interact with a yuuvis backend.
 *
 *
 */

@NgModule({
  imports: [HttpClientModule, TranslateModule.forRoot(), DeviceDetectorModule.forRoot()],
  exports: [YuvCoreSharedModule]
})
export class YuvCoreModule {
  static forRoot(config?: CoreConfig): ModuleWithProviders<YuvCoreModule> {
    return {
      ngModule: YuvCoreModule,
      providers: [
        CoreInit,
        { provide: Logger, useClass: LoggerConsoleService },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: OfflineInterceptor, multi: true },
        { provide: CUSTOM_CONFIG, useValue: config },
        { provide: CORE_CONFIG, useClass: CoreConfig, deps: [CUSTOM_CONFIG] },
        {
          provide: APP_INITIALIZER,
          useFactory: init_module,
          deps: [CoreInit],
          multi: true
        },
        /**
         * overriding translate modules defaults
         * this works because providers are singletons
         */
        {
          provide: TranslateLoader,
          useClass: EoxTranslateJsonLoader,
          deps: [HttpClient, CORE_CONFIG]
        },
        {
          provide: MissingTranslationHandler,
          useClass: EoxMissingTranslationHandler
        }
      ]
    };
  }

  /**
   * @ignore
   */
  constructor(@Optional() @SkipSelf() parentModule: YuvCoreModule) {
    if (parentModule) {
      throw new Error('YuvCoreModule is already loaded.');
    }
  }
}
