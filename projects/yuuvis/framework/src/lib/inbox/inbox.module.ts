import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common';
import { YuvComponentsModule } from '../components';
import { InboxListComponent } from './inbox-list/inbox-list.component';

@NgModule({
  imports: [CommonModule, YuvComponentsModule, TranslateModule, YuvCommonModule],
  declarations: [InboxListComponent],
  exports: [InboxListComponent]
})
export class YuvInboxModule {}
