import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common';
import { YuvComponentsModule } from '../components';
import { InboxListComponent } from './inbox-list/inbox-list.component';
import { InboxDataService } from './services/inboxData.service';

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule],
  declarations: [InboxListComponent],
  providers: [InboxDataService],
  exports: [InboxListComponent]
})
export class YuvInboxModule {}
