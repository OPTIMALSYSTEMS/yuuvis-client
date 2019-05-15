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

/**
 * `YuvFrameworkModule` provides a set of UI components to be used
 * when creating yuuvis client applications. It also re-exports the 
 * `YuvCommonUiModule` containing more low level components like SVG icons.
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
