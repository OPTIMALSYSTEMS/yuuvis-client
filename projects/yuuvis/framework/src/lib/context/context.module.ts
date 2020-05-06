import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvColumnConfigModule } from '../column-config/column-config.module';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvSearchModule } from '../search/search.module';
import { YuvPipesModule } from './../pipes/pipes.module';
import { ContextComponent } from './context/context.component';

@NgModule({
  declarations: [ContextComponent],
  exports: [ContextComponent],
  imports: [CommonModule, TranslateModule, YuvDirectivesModule, YuvPipesModule, YuvSearchModule, YuvCommonModule, YuvComponentsModule, YuvColumnConfigModule]
})
export class YuvContextModule {}
