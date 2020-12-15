import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvObjectDetailsModule } from '../object-details/object-details.module';
import { ProcessDetailsComponent } from './process-details/process-details.component';
import { ProcessListEmptyComponent } from './process-list-empty/process-list-empty.component';
import { ProcessListComponent } from './process-list/process-list.component';

const components = [ProcessDetailsComponent, ProcessListComponent, ProcessListEmptyComponent];
@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule, YuvObjectDetailsModule],
  declarations: [...components],
  entryComponents: [...components],
  exports: [...components]
})
export class YuvBpmModule {}
