import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { ProcessListComponent } from './process-list/process-list.component';

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule],
  declarations: [ProcessListComponent],
  exports: [ProcessListComponent]
})
export class YuvBpmModule {}
