import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BpmEvent, EventService, Process, ProcessDefinitionKey, ProcessService, TranslateService } from '@yuuvis/core';
import {
  FormatProcessDataService,
  HeaderDetails,
  IconRegistryService,
  PluginsService,
  ProcessRow,
  ResponsiveTableData,
  arrowNext,
  edit,
  listModeDefault,
  listModeGrid,
  listModeSimple,
  refresh
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { followUp } from './../../../../projects/yuuvis/framework/src/lib/svg.generated';

@Component({
  selector: 'yuv-follow-ups',
  templateUrl: './follow-ups.component.html',
  styleUrls: ['./follow-ups.component.scss']
})
export class FollowUpsComponent implements OnInit {
  destroyRef = inject(DestroyRef);
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
    })
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
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-follow-ups');
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

  onSlaveClosed() { }

  private fetchProcesses() {
    this.processService.fetchProcesses(ProcessDefinitionKey.FOLLOW_UP, {
      startedBy: this.pluginsService.getCurrentUser().id,
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
