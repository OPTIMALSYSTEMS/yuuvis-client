import { Component, OnDestroy, OnInit } from '@angular/core';
import { BpmEvent, DmsObject, DmsService, EventService, ProcessData, ProcessService, TranslateService } from '@yuuvis/core';
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
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit, OnDestroy {
  layoutOptionsKey = 'yuv.app.processes';
  objectDetailsID: string;
  itemIsSelected = false;
  dmsObject$: Observable<DmsObject>;
  processData$: Observable<ResponsiveTableData> = this.processService.processData$.pipe(
    map((processData: ProcessData[]) => this.formatProcessDataService.formatProcessDataForTable(processData))
  );

  headerDetails = {
    title: this.translateService.instant('yuv.framework.process-list.process'),
    description: '',
    icon: 'process'
  };

  constructor(
    private dmsService: DmsService,
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

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = businessKey ? this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true))) : of(null);
  }

  refreshList() {
    this.getProcesses().subscribe();
  }

  selectedItem(item) {
    this.getSelectedDetail(item[0]?.documentId);
  }

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
