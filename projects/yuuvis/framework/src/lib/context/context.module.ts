import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { YuvComponentsModule } from '../components/components.module';
import { YuvSearchModule } from '../search/search.module';
import { ContextComponent } from './context/context.component';

@NgModule({
  declarations: [ContextComponent],
  exports: [ContextComponent],
  imports: [CommonModule, TranslateModule, YuvSearchModule, YuvCommonUiModule, YuvComponentsModule]
})
export class YuvContextModule {}
