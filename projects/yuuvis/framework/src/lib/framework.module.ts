import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { YuvFormModule } from './form';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { YuvCoreModule, CUSTOM_CONFIG, CORE_CONFIG, CoreConfig } from '@yuuvis/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { YuvSearchModule } from './search/search.module';
import { YuvUserModule } from './user/user.module';
import { YuvObjectDetailsModule } from './object-details/object-details.module';
import { YuvComponentsModule } from './components/components.module';

/**
 * `YuvFrameworkModule` provides a set of UI components to be used
 * when creating yuuvis client applications. It also re-exports the 
 * `YuvCommonUiModule` containing more low level components like SVG icons.
 * `YuvCoreModule` is also part of this library, so the provided components
 * are able to communicate with the Yuuyis backend services. So if you import
 * `YuvFrameworkModule` you don't need to import either one of those modeules.
 * 
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
    OverlayPanelModule,
    YuvCommonUiModule,
    AngularSplitModule.forRoot(),    
    YuvCoreModule.forRoot()
  ],
  exports: [
    YuvFormModule,
    YuvSearchModule,
    YuvObjectDetailsModule,
    YuvUserModule,
    YuvComponentsModule,
    YuvCommonUiModule,
    YuvCoreModule,
    OverlayPanelModule,
    AngularSplitModule
  ]
})
export class YuvFrameworkModule {
  static forRoot(config?: CoreConfig): ModuleWithProviders {
    return {
      ngModule: YuvFrameworkModule,
      providers: [
        { provide: CUSTOM_CONFIG, useValue: config },
        { provide: CORE_CONFIG, useClass: CoreConfig, deps: [CUSTOM_CONFIG] },
      ]
    };
  }
}
