import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { YuvColumnConfigModule } from '../column-config/column-config.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvSearchModule } from '../search/search.module';
import { YuvPipesModule } from './../pipes/pipes.module';
import { ContextComponent } from './context/context.component';

@NgModule({
  declarations: [ContextComponent],
  exports: [ContextComponent],
  imports: [CommonModule, TranslateModule, YuvPipesModule, YuvSearchModule, YuvCommonUiModule, YuvComponentsModule, YuvColumnConfigModule]
})
export class YuvContextModule {}
