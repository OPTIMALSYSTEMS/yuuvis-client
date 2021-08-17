import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, InboxService, TaskData, TranslateService } from '@yuuvis/core';
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
  PluginsService,
  refresh,
  ResponsiveTableData,
  Task
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.inbox';
  contextError: string;
  selectedTasks: Task[];
  detailsTask: Task;
  inboxData$: Observable<ResponsiveTableData> = this.inboxService.inboxData$.pipe(
    map((taskData: TaskData[]) => this.formatProcessDataService.formatTaskDataForTable(taskData)),
    map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null))
  );
  loading$: Observable<boolean> = this.inboxService.loadingInboxData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.inbox.title'),
    description: '',
    icon: 'inbox'
  };

  plugins: any;

  constructor(
    private inboxService: InboxService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService,
    private pluginsService: PluginsService
  ) {
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-inbox');
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getInbox(): void {
    return this.inboxService.fetchTasks();
  }

  selectedItem(items: Task[]) {
    this.selectedTasks = items;
    this.detailsTask = items ? items[items.length - 1] : null;
  }

  refreshList() {
    this.inboxService.fetchTasks();
  }

  remove() {
    this.inboxService.completeTask(this.selectedTasks[0].id).subscribe();
  }

  onSlaveClosed() {}

  ngOnInit(): void {
    this.getInbox();
    this.eventService
      .on(BpmEvent.BPM_EVENT)
      .pipe(
        takeUntilDestroy(this),
        tap(() => this.inboxService.fetchTasks())
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
