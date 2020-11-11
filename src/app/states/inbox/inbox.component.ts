import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppCacheService, BpmEvent, EventService, InboxService, ProcessDefinitionKey, TaskData, TranslateService } from '@yuuvis/core';
import {
  arrowNext,
  edit,
  FormatProcessDataService,
  HeaderDetails,
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
  loading$: Observable<boolean> = this.inboxService.loadingInboxData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.framework.inbox-list.inbox'),
    description: '',
    icon: 'inbox'
  };

  constructor(
    private inboxService: InboxService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService,
    private appCache: AppCacheService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
    // TODO: nasty hack: remove once grid renders view mode from extern
    this.appCache
      .getItem(this.layoutOptionsKey)
      .pipe(switchMap((cache) => this.appCache.setItem(this.layoutOptionsKey, { ...cache, 'yuv-responsive-data-table': { viewMode: 'horizontal' } })))
      .subscribe();
  }

  private getInbox(): Observable<TaskData[]> {
    return this.inboxService.getTasks().pipe(take(1), takeUntilDestroy(this));
  }

  selectedItem(item) {
    this.selectedProcess = item;
    this.objectId = item[0]?.documentId ? item[0]?.documentId : ProcessDefinitionKey.INVALID_TYPE;
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
        takeUntilDestroy(this),
        switchMap(() => this.getInbox())
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
