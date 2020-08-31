import { Component, OnInit } from '@angular/core';
import { DmsObject, DmsService, InboxService, ProcessDefinitionKey, TaskData } from '@yuuvis/core';
import {
  arrowNext,
  edit,
  FormatProcessDataService,
  IconRegistryService,
  inbox,
  listModeDefault,
  listModeGrid,
  listModeSimple,
  refresh,
  ResponsiveTableData
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  layoutOptionsKey = 'yuv.app.inbox';
  objectDetailsID: string;
  itemIsSelected = false;
  dmsObject$: Observable<DmsObject>;
  inboxData$: Observable<ResponsiveTableData> = this.inboxService
    .getTasks(ProcessDefinitionKey.FOLLOW_UP)
    .pipe(map((val: TaskData[]) => this.formatProcessDataService.formatTaskDataForTable(val)));

  headerDetails = { title: 'yuv.framework.inbox-list.inbox', description: 'yuv.framework.inbox-list.inbox.description', icon: 'inbox' };
  constructor(
    private inboxService: InboxService,
    private dmsService: DmsService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true)));
  }

  selectedItem(item) {
    this.getSelectedDetail(item[0].documentId);
  }

  refreshList() {
    this.inboxService.getTasks(ProcessDefinitionKey.FOLLOW_UP).pipe(take(1)).subscribe();
  }

  ngOnInit(): void {
    this.inboxService.getTasks(ProcessDefinitionKey.FOLLOW_UP).pipe(take(1)).subscribe();
  }
}
