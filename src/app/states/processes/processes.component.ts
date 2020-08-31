import { Component } from '@angular/core';
import { DmsObject, DmsService, ProcessData, ProcessService } from '@yuuvis/core';
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
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent {
  layoutOptionsKey = 'yuv.app.processes';
  objectDetailsID: string;
  itemIsSelected = false;
  dmsObject$: Observable<DmsObject>;
  processData$: Observable<ResponsiveTableData> = this.processService
    .getProcesses()
    .pipe(map((processData: ProcessData[]) => this.formatProcessDataService.formatProcessDataForTable(processData)));

  headerDetails = { title: 'yuv.framework.process-list.process', description: 'yuv.framework.process-list.process.description', icon: 'process' };

  constructor(
    private dmsService: DmsService,
    private processService: ProcessService,
    private formatProcessDataService: FormatProcessDataService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, process, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true)));
  }

  refreshList() {
    this.processData$ = this.processService
      .getProcesses()
      .pipe(map((processData: ProcessData[]) => this.formatProcessDataService.formatProcessDataForTable(processData)));
  }
  selectedItem(item) {
    this.getSelectedDetail(item[0].documentId);
  }
}
