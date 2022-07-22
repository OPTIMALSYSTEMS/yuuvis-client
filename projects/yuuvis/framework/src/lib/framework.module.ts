import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { CoreConfig, CORE_CONFIG, CUSTOM_CONFIG, YuvCoreModule, YuvCoreSharedModule } from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { ToastrModule } from 'ngx-toastr';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { YuvActionModule } from './actions/action.module';
import { YuvBpmModule } from './bpm/bpm.module';
import { YuvColumnConfigModule } from './column-config/column-config.module';
import { YuvCommonModule } from './common/common.module';
import { YuvComponentsModule } from './components/components.module';
import { YuvContextModule } from './context/context.module';
import { YuvDirectivesModule } from './directives/directives.module';
import { YuvFormModule } from './form/form.module';
import { YuvGroupedSelectModule } from './grouped-select/grouped-select.module';
import { YuvObjectCreateModule } from './object-create/object-create.module';
import { YuvObjectDetailsModule } from './object-details/object-details.module';
import { YuvObjectFormModule } from './object-form/object-form.module';
import { YuvPipesModule } from './pipes/pipes.module';
import { YuvPluginsModule } from './plugins/plugins.module';
import { YuvPopoverModule } from './popover/popover.module';
import { YuvQuickfinderModule } from './quickfinder/quickfinder.module';
import { ROUTES, YuvRoutes } from './routing/routes';
import { YuvSearchModule } from './search/search.module';
import { YuvSequenceListModule } from './sequence-list/sequence-list.module';
import { ErrorHandlerService } from './services/error-handler/error-handler.service';
import { SingleCellRendererComponent } from './services/grid/renderer/single-cell-renderer/single-cell-renderer.component';
import { YuvUserModule } from './user/user.module';
import { YuvVersionsModule } from './versions/versions.module';

const modules = [
  YuvGroupedSelectModule,
  YuvFormModule,
  YuvPopoverModule,
  YuvComponentsModule,
  YuvSearchModule,
  YuvVersionsModule,
  YuvUserModule,
  YuvCommonModule,
  YuvObjectDetailsModule,
  YuvColumnConfigModule,
  YuvObjectCreateModule,
  YuvSequenceListModule,
  YuvQuickfinderModule,
  YuvPipesModule,
  YuvActionModule,
  YuvCoreSharedModule,
  OverlayPanelModule,
  YuvBpmModule,
  YuvPluginsModule
];

/**
 * `YuvFrameworkModule` provides a set of UI components to be used
 * when creating yuuvis client applications.
 * `YuvCoreModule` is also part of this library, so the provided components
 * are able to communicate with the Yuuyis backend services. So if you import
 * `YuvFrameworkModule` you don't need to import either one of those modeules.
 * Other third-party modules that are used and re-exported as well:
 * - [AngularSplitModule](https://github.com/bertrandg/angular-split)
 * - PrimeNG [OverlayPanelModule](https://www.primefaces.org/primeng/#/overlaypanel)
 */

@NgModule({
  imports: [CommonModule, ...modules, AngularSplitModule, YuvCoreModule.forRoot(), ToastrModule.forRoot()],
  exports: [YuvDirectivesModule, ...modules, YuvObjectFormModule, YuvContextModule, YuvCoreModule, AngularSplitModule, ToastrModule],
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
  declarations: [SingleCellRendererComponent]
})
export class YuvFrameworkModule {
  static forRoot(config?: CoreConfig, routes?: YuvRoutes): ModuleWithProviders<YuvFrameworkModule> {
    return {
      ngModule: YuvFrameworkModule,
      providers: [
        { provide: CUSTOM_CONFIG, useValue: config },
        { provide: CORE_CONFIG, useClass: CoreConfig, deps: [CUSTOM_CONFIG] },
        { provide: ROUTES, useValue: routes }
      ]
    };
  }
}
