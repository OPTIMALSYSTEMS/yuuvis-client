import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, InboxService, TaskData, TranslateService } from '@yuuvis/core';
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
import { map, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.inbox';
  contextError: string;
  objectDetailsID: string;
  itemIsSelected = false;
  objectId: string;
  selectedProcess: any;
  inboxData$: Observable<ResponsiveTableData> = this.inboxService.inboxData$.pipe(
    map((taskData: TaskData[]) => ({ ...this.formatProcessDataService.formatTaskDataForTable(taskData), currentViewMode: 'horizontal' })),
    map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null))
  );

  headerDetails = {
    title: this.translateService.instant('yuv.framework.inbox-list.inbox'),
    description: '',
    icon: 'inbox'
  };

  constructor(
    private inboxService: InboxService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getInbox(): Observable<TaskData[]> {
    return this.inboxService.getTasks().pipe(take(1), takeUntilDestroy(this));
  }

  selectedItem(item) {
    this.selectedProcess = item;
    this.objectId = item[0]?.documentId;
    this.itemIsSelected = true;
  }

  refreshList() {
    this.getInbox().subscribe();
  }

  remove() {
    this.inboxService
      .completeTask(this.selectedProcess[0].id)
      .pipe(switchMap(() => this.getInbox()))
      .subscribe();
  }

  onSlaveClosed() {}

  ngOnInit(): void {
    this.getInbox().subscribe();
    this.eventService
      .on(BpmEvent.BPM_EVENT)
      .pipe(
        take(1),
        switchMap(() => this.getInbox()),
        takeUntilDestroy(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
