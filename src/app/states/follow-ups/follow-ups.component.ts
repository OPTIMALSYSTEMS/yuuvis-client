import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, Process, ProcessDefinitionKey, ProcessService, TranslateService } from '@yuuvis/core';
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
  ProcessRow,
  refresh,
  ResponsiveTableData
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { followUp } from './../../../../projects/yuuvis/framework/src/lib/svg.generated';

@Component({
  selector: 'yuv-follow-ups',
  templateUrl: './follow-ups.component.html',
  styleUrls: ['./follow-ups.component.scss']
})
export class FollowUpsComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.follow-ups';
  selectedFollowUp: Process;
  processData$: Observable<ResponsiveTableData> = this.processService.processData$.pipe(
    map((processData: Process[]) => {
      const pd = this.filterTerm
        ? processData.filter((t: Process) => {
            return t.subject && t.subject.toLowerCase().indexOf(this.filterTerm) !== -1;
          })
        : processData;
      return this.formatProcessDataService.formatFollowUpDataForTable(pd, ['type', 'subject', 'startTime', 'expiryDateTime', 'status']);
    }),
    map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null))
  );
  loading$: Observable<boolean> = this.processService.loadingProcessData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.follow-ups.title'),
    description: '',
    icon: 'followUp'
  };

  plugins: any;
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
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, followUp, listModeDefault, listModeGrid, listModeSimple]);
  }

  selectedItem(items: ProcessRow[]) {
    this.selectedFollowUp = items?.length ? items[0].originalData : null;
  }

  refreshList() {
    this.fetchProcesses();
  }

  removeFollowUp(id: string) {
    this.processService
      .deleteProcess(id)
      .pipe(tap(() => this.fetchProcesses()))
      .subscribe();
  }

  onSlaveClosed() {}

  private fetchProcesses() {
    this.processService.fetchProcesses(ProcessDefinitionKey.FOLLOW_UP, {
      isCompleted: false
    });
  }

  onTermFilterChange(term) {
    this.filterTerm = term;
    this.processService.reEmitProcessData();
  }

  ngOnInit(): void {
    this.fetchProcesses();
    this.eventService
      .on(BpmEvent.BPM_EVENT)
      .pipe(
        tap(() => this.fetchProcesses()),
        takeUntilDestroy(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
