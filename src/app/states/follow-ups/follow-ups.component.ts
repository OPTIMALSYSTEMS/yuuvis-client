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
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { followUp } from './../../../../projects/yuuvis/framework/src/lib/svg.generated';

@Component({
  selector: 'yuv-follow-ups',
  templateUrl: './follow-ups.component.html',
  styleUrls: ['./follow-ups.component.scss']
})
export class FollowUpsComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.follow-ups';
  // contextError: string;
  // objectDetailsID: string;
  // itemIsSelected = false;
  // objectId: string;
  selectedObjectId: string;
  processData$: Observable<ResponsiveTableData>;
  loading$: Observable<boolean> = this.processService.loadingProcessData$;

  headerDetails: HeaderDetails = {
    title: this.translateService.instant('yuv.client.state.follow-ups.title'),
    description: '',
    icon: 'followUp'
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
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, followUp, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getProcesses(): Observable<ResponsiveTableData> {
    return this.processService.getProcesses(ProcessDefinitionKey.FOLLOW_UP).pipe(
      take(1),
      map((processData: Process[]) => this.formatProcessDataService.formatFollowUpDataForTable(processData, ['subject', 'startTime', 'expiryDateTime'])),
      map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null)),
      tap((data) => (this.processData$ = of(data))),
      takeUntilDestroy(this)
    );
  }

  selectedItem(items: ProcessRow[]) {
    this.selectedObjectId = items?.length && items[0].originalData.attachments?.length ? items[0].originalData.attachments[0] : null;
  }

  refreshList() {
    this.getProcesses().subscribe();
  }

  remove() {
    // this.processService
    //   .deleteFollowUp(this.selectedProcess[0].id)
    //   .pipe(switchMap(() => this.getProcesses()))
    //   .subscribe();
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
