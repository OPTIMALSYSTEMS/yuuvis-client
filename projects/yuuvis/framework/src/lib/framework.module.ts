import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import {
  CoreConfig,
  CORE_CONFIG,
  CUSTOM_CONFIG,
  YuvCoreModule,
  YuvCoreSharedModule
} from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { YuvComponentsModule } from './components/components.module';
import { YuvFormModule } from './form';
import { YuvObjectDetailsModule } from './object-details/object-details.module';
import { YuvPipesModule } from './pipes/pipes.module';
import { YuvSearchModule } from './search/search.module';
import { YuvUserModule } from './user/user.module';

/**
 * `YuvFrameworkModule` provides a set of UI components to be used
 * when creating yuuvis client applications. It also re-exports the
 * `YuvCommonUiModule` containing more low level components like SVG icons.
 * `YuvCoreModule` is also part of this library, so the provided components
 * are able to communicate with the Yuuyis backend services. So if you import
 * `YuvFrameworkModule` you don't need to import either one of those modeules.
 * Other third-party modules that are used and re-exported as well:
 * - [AngularSplitModule](https://github.com/bertrandg/angular-split)
 * - PrimeNG [OverlayPanelModule](https://www.primefaces.org/primeng/#/overlaypanel)
 */

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    YuvFormModule,
    YuvSearchModule,
    YuvUserModule,
    YuvCommonUiModule,
    YuvObjectDetailsModule,
    YuvPipesModule,
    OverlayPanelModule,
    YuvCommonUiModule,
    AngularSplitModule.forRoot(),
    YuvCoreModule.forRoot(),
    AngularSplitModule.forRoot(),
    YuvCoreSharedModule
  ],
  exports: [
    YuvFormModule,
    YuvSearchModule,
    YuvObjectDetailsModule,
    YuvPipesModule,
    YuvUserModule,
    YuvComponentsModule,
    YuvCommonUiModule,
    YuvCoreModule,
    OverlayPanelModule,
    AngularSplitModule,
    YuvCoreSharedModule
  ]
})
export class YuvFrameworkModule {
  static forRoot(config?: CoreConfig): ModuleWithProviders {
    return {
      ngModule: YuvFrameworkModule,
      providers: [
        { provide: CUSTOM_CONFIG, useValue: config },
        { provide: CORE_CONFIG, useClass: CoreConfig, deps: [CUSTOM_CONFIG] }
      ]
    };
  }
}
