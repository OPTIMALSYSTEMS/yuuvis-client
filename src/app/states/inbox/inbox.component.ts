import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, DmsObject, DmsService, EventService, InboxService, TranslateService } from '@yuuvis/core';
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
import { map, switchMap, take, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { TaskData } from './../../../../projects/yuuvis/core/src/lib/service/bpm/model/bpm.model';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
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
    private iconRegistry: IconRegistryService,
    private eventService: EventService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getInbox(): Observable<TaskData[]> {
    return this.inboxService.getTasks().pipe(take(1), takeUntilDestroy(this));
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = businessKey ? this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true))) : of(null);
  }

  selectedItem(item) {
    this.getSelectedDetail(item[0]?.documentId);
  }

  refreshList() {
    this.getInbox().subscribe();
  }

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
