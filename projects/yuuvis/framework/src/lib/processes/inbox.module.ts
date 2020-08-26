import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { InboxListComponent } from './inbox-list/inbox-list.component';
import { ProcessListComponent } from './process-list/process-list.component';

const components = [InboxListComponent, ProcessListComponent];

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule],
  declarations: [...components],
  exports: [...components]
})
export class YuvInboxModule {}
