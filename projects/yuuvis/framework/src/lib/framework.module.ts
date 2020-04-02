import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { CoreConfig, CORE_CONFIG, CUSTOM_CONFIG, YuvCoreModule, YuvCoreSharedModule } from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { ToastrModule } from 'ngx-toastr';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ActionModule } from './actions/action.module';
import { YuvColumnConfigModule } from './column-config/column-config.module';
import { YuvComponentsModule } from './components/components.module';
import { YuvContextModule } from './context/context.module';
import { YuvDirectivesModule } from './directives/directives.module';
import { YuvFormModule } from './form/form.module';
import { YuvGroupedSelectModule } from './grouped-select/grouped-select.module';
import { YuvObjectCreateModule } from './object-create/object-create.module';
import { YuvObjectDetailsModule } from './object-details/object-details.module';
import { YuvObjectFormModule } from './object-form/object-form.module';
import { YuvPipesModule } from './pipes/pipes.module';
import { YuvPopoverModule } from './popover/popover.module';
import { YuvSearchModule } from './search/search.module';
import { ErrorHandlerService } from './services/error-handler/error-handler.service';
import { YuvUserModule } from './user/user.module';
import { YuvVersionsModule } from './versions/versions.module';

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
    YuvGroupedSelectModule,
    YuvFormModule,
    YuvPopoverModule,
    YuvSearchModule,
    YuvVersionsModule,
    YuvUserModule,
    YuvCommonUiModule,
    YuvObjectDetailsModule,
    YuvColumnConfigModule,
    YuvObjectCreateModule,
    YuvPipesModule,
    OverlayPanelModule,
    ActionModule,
    YuvCoreSharedModule,
    YuvComponentsModule,
    AngularSplitModule.forRoot(),
    YuvCoreModule.forRoot(),
    ToastrModule.forRoot()
  ],
  exports: [
    YuvDirectivesModule,
    YuvFormModule,
    YuvGroupedSelectModule,
    YuvPopoverModule,
    YuvComponentsModule,
    YuvObjectDetailsModule,
    YuvColumnConfigModule,
    YuvPipesModule,
    YuvSearchModule,
    YuvVersionsModule,
    YuvUserModule,
    YuvComponentsModule,
    YuvObjectFormModule,
    YuvContextModule,
    YuvCommonUiModule,
    YuvCoreModule,
    OverlayPanelModule,
    AngularSplitModule,
    YuvCoreSharedModule,
    YuvObjectCreateModule,
    ActionModule,
    ToastrModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerService,
      multi: true
    },
    {
      // provide a error handling for the current platform
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    }
  ],
  declarations: []
})
export class YuvFrameworkModule {
  static forRoot(config?: CoreConfig): ModuleWithProviders<YuvFrameworkModule> {
    return {
      ngModule: YuvFrameworkModule,
      providers: [
        { provide: CUSTOM_CONFIG, useValue: config },
        { provide: CORE_CONFIG, useClass: CoreConfig, deps: [CUSTOM_CONFIG] }
      ]
    };
  }
}
