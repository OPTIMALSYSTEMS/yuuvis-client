import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common';
import { YuvComponentsModule } from '../components';
import { InboxListComponent } from './inbox-list/inbox-list.component';
import { ProcessListComponent } from './process-list/process-list.component';
import { FormatProcessDataService } from './services/formatProcessData.service';

const components = [InboxListComponent, ProcessListComponent];

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule],
  declarations: [...components],
  providers: [FormatProcessDataService],
  exports: [...components]
})
export class YuvInboxModule {}
