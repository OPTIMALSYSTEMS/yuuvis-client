import { Component, OnInit } from '@angular/core';
import { DmsObject, DmsService, InboxService, TaskData, TranslateService } from '@yuuvis/core';
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
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  layoutOptionsKey = 'yuv.app.inbox';
  layoutOptionsKeyList = 'yuv.app.inbox.list';
  objectDetailsID: string;
  itemIsSelected = false;
  dmsObject$: Observable<DmsObject>;
  inboxData$: Observable<ResponsiveTableData> = this.inboxService.inboxData$.pipe(
    map((taskData: TaskData[]) => ({ ...this.formatProcessDataService.formatTaskDataForTable(taskData), currentViewMode: 'standard' }))
  );

  headerDetails = {
    title: this.translateService.instant('yuv.framework.inbox-list.inbox'),
    description: '',
    icon: 'inbox'
  };
  constructor(
    private inboxService: InboxService,
    private dmsService: DmsService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = businessKey ? this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true))) : of(null);
  }

  selectedItem(item) {
    this.getSelectedDetail(item[0]?.documentId);
  }

  refreshList() {
    this.inboxService.getTasks().pipe(take(1)).subscribe();
  }

  ngOnInit(): void {
    this.inboxService.getTasks().pipe(take(1)).subscribe();
  }
}
