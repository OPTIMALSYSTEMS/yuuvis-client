import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, EventService, ProcessData, ProcessService, TranslateService } from '@yuuvis/core';
import {
  arrowNext,
  edit,
  FormatProcessDataService,
  IconRegistryService,
  listModeDefault,
  listModeGrid,
  listModeSimple,
  process,
  refresh,
  ResponsiveTableData
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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
  itemIsSelected = false;
  objectId: string;
  selectedProcess: any;
  processData$: Observable<ResponsiveTableData> = this.processService.processData$.pipe(
    map((processData: ProcessData[]) => this.formatProcessDataService.formatProcessDataForTable(processData)),
    map((taskData: ResponsiveTableData) => (taskData.rows.length ? taskData : null))
  );

  headerDetails = {
    title: this.translateService.instant('yuv.framework.process-list.process'),
    description: '',
    icon: 'process'
  };

  constructor(
    private processService: ProcessService,
    private translateService: TranslateService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService,
    private eventService: EventService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, process, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getProcesses(): Observable<ProcessData[]> {
    return this.processService.getProcesses().pipe(take(1), takeUntilDestroy(this));
  }

  selectedItem(item) {
    this.objectId = item[0]?.documentId;
    this.itemIsSelected = true;
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
        take(1),
        switchMap(() => this.getProcesses()),
        takeUntilDestroy(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
