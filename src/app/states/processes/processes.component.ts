import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, Process, ProcessRow, ProcessService, TranslateService } from '@yuuvis/core';
import {
  arrowNext,
  edit,
  FormatProcessDataService,
  HeaderDetails,
  IconRegistryService,
  listModeDefault,
  listModeGrid,
  listModeSimple,
  PluginsService,
  process,
  refresh,
  ResponsiveTableData
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'yuv-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.processes';
  contextError: string;
  selectedProcess: Process;
  processData$: Observable<ResponsiveTableData> = this.processService.processData$.pipe(
    map((processData: Process[]) => {
      const pd = this.filterTerm
        ? processData.filter((t: Process) => {
            return t.subject && t.subject.toLowerCase().indexOf(this.filterTerm.toLowerCase()) !== -1;
          })
        : processData;
      return this.formatProcessDataService.formatProcessDataForTable(pd, ['type', 'subject', 'startTime', 'status', 'endTime']);
    })
  );
  loading$: Observable<boolean> = this.processService.loadingProcessData$;
  statusFilter;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.process.title'),
    description: '',
    icon: 'process'
  };
  plugins: any;
  attachmentPlugins: any;
  filterTerm: string;

  constructor(
    private processService: ProcessService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService,
    private pluginsService: PluginsService
  ) {
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-processes');
    this.attachmentPlugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-processes-attachments');
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, process, listModeDefault, listModeGrid, listModeSimple]);
  }

  selectedItem(items: ProcessRow[]) {
    this.selectedProcess = items?.length ? items[0].originalData : null;
  }

  onTermFilterChange(term) {
    this.filterTerm = term;
    this.processService.reEmitProcessData();
  }

  refreshList() {
    this.fetchProcesses(this.statusFilter);
  }

  onStatusFilterChange(statusFilter: 'all' | 'running' | 'completed') {
    this.statusFilter = statusFilter;
    this.fetchProcesses(this.statusFilter || 'all');
  }

  private fetchProcesses(statusFilter: 'all' | 'running' | 'completed' = 'all') {
    if (statusFilter === 'all') {
      this.processService.fetchProcesses();
    } else {
      this.processService.fetchProcesses(null, {
        isCompleted: statusFilter === 'completed'
      });
    }
  }

  remove() {
    this.processService
      .deleteProcess(this.selectedProcess[0].id)
      .pipe(tap(() => this.fetchProcesses(this.statusFilter)))
      .subscribe();
  }

  onSlaveClosed() {}

  ngOnInit(): void {
    this.fetchProcesses('running');
    this.eventService
      .on(BpmEvent.BPM_EVENT)
      .pipe(
        tap(() => this.processService.fetchProcesses()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
