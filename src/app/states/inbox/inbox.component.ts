import { Component } from '@angular/core';
import { DmsObject, DmsService, InboxService, ProcessDefinitionKey } from '@yuuvis/core';
import { arrowNext, edit, IconRegistryService, inbox, InboxDataService, listModeDefault, listModeGrid, listModeSimple, refresh } from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  layoutOptionsKey = 'yuv.app.inbox';
  objectDetailsID: string;
  itemIsSelected = false;
  dmsObject$: Observable<DmsObject>;
  inboxData$: Observable<any> = this.inboxService.getInbox(ProcessDefinitionKey.FOLLOW_UP).pipe(map(this.inboxDataService.formatInboxProcessDataForTable));

  constructor(
    private inboxService: InboxService,
    private dmsService: DmsService,
    private inboxDataService: InboxDataService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true)));
  }

  selectedItem(item) {
    this.getSelectedDetail(item[0].businessKey);
  }
}
