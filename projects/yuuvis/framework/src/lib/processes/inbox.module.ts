import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common';
import { YuvComponentsModule } from '../components';
import { InboxListComponent } from './inbox-list/inbox-list.component';
import { ProcessesListComponent } from './processes-list/processes-list.component';
import { FormatProcessDataService } from './services/formatProcessData.service';

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvCoreModule, TranslateModule, YuvCommonModule],
  declarations: [InboxListComponent, ProcessesListComponent],
  providers: [FormatProcessDataService],
  exports: [InboxListComponent, ProcessesListComponent]
})
export class YuvInboxModule {}
