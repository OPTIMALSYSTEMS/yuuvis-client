import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, ProcessData, ProcessDefinitionKey, ProcessService, TranslateService } from '@yuuvis/core';
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
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.processes';
  contextError: string;
  objectDetailsID: string;
  objectId: string;
  selectedProcess: any;
  processData$: Observable<ResponsiveTableData>;
  loading$: Observable<boolean> = this.processService.loadingProcessData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.process.title'),
    description: '',
    icon: 'process'
  };

  plugins: any;

  constructor(
    private processService: ProcessService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService,
    private pluginsService: PluginsService
  ) {
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-processes');
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, process, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getProcesses(): Observable<ProcessData[] | ResponsiveTableData> {
    return this.processService.getProcesses().pipe(
      take(1),
      map((processData: ProcessData[]) => this.formatProcessDataService.formatProcessDataForTable(processData, ['type', 'subject', 'startTime', 'status'])),
      map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null)),
      tap((data) => (this.processData$ = of(data))),
      takeUntilDestroy(this)
    );
  }

  selectedItem(item: any[]) {
    this.selectedProcess = item;
    this.objectId = item[0] ? item[0]?.documentId || ProcessDefinitionKey.INVALID_TYPE : null;
  }

  refreshList() {
    this.getProcesses().subscribe();
  }

  remove() {
    this.processService
      .deleteFollowUp(this.selectedProcess[0].id)
      .pipe(switchMap(() => this.getProcesses()))
      .subscribe();
  }

  onSlaveClosed() {}

  ngOnInit(): void {
    this.getProcesses().subscribe();
    this.eventService
      .on(BpmEvent.BPM_EVENT)
      .pipe(
        switchMap(() => this.getProcesses()),
        takeUntilDestroy(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
