import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvActionModule } from '../actions/action.module';
import { YuvColumnConfigModule } from '../column-config/column-config.module';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvSearchModule } from '../search/search.module';
import { YuvPipesModule } from './../pipes/pipes.module';
import { YuvPluginsModule } from './../plugins/plugins.module';
import { ContextComponent } from './context/context.component';

/**
 * `YuvContextModule` contains component for rendering a context and its contents.
 */
@NgModule({
  declarations: [ContextComponent],
  entryComponents: [ContextComponent],
  exports: [ContextComponent],
  imports: [
    CommonModule,
    YuvActionModule,
    TranslateModule,
    YuvDirectivesModule,
    YuvPipesModule,
    YuvSearchModule,
    YuvCommonModule,
    YuvComponentsModule,
    YuvColumnConfigModule,
    YuvPluginsModule
  ]
})
export class YuvContextModule {}
