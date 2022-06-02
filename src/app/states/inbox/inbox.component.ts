import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, InboxService, Task, TaskRow, TranslateService } from '@yuuvis/core';
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
  SystemService
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FrameService } from '../../components/frame/frame.service';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.inbox';
  contextError: string;
  selectedTasks: TaskRow[];
  detailsTask: Task;
  inboxData$: Observable<ResponsiveTableData> = this.inboxService.inboxData$.pipe(
    map((taskData: Task[]) => {
      const td = this.filterTerm
        ? taskData.filter((t: Task) => {
            const l = this.system.getLocalizedResource(`${t.name}_label`);
            return (
              (t.subject && t.subject.toLowerCase().indexOf(this.filterTerm.toLowerCase()) !== -1) ||
              (l && l.toLowerCase().indexOf(this.filterTerm.toLowerCase()) !== -1)
            );
          })
        : taskData;
      return this.formatProcessDataService.formatTaskDataForTable([...td]);
    })
  );
  loading$: Observable<boolean> = this.inboxService.loadingInboxData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.inbox.title'),
    description: '',
    icon: 'inbox'
  };

  plugins: any;
  filterTerm: string;

  constructor(
    private inboxService: InboxService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService,
    private frameService: FrameService,
    private system: SystemService,
    private pluginsService: PluginsService
  ) {
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-inbox');
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, inbox, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getInbox(): void {
    return this.inboxService.fetchTasks();
  }

  selectedItem(items: TaskRow[]) {
    this.selectedTasks = items;
    this.detailsTask = items && items.length ? items[items.length - 1].originalData : null;
  }

  refreshList() {
    this.inboxService.fetchTasks();
  }

  onSlaveClosed() {}

  onAttachmentOpenExternal(id: string) {
    let uri = `${this.frameService.getAppRootPath()}object/${id}`;
    window.open(uri);
  }

  onTermFilterChange(term) {
    this.filterTerm = term;
    this.inboxService.reEmitInboxData();
  }

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
