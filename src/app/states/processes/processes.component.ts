import { Component } from '@angular/core';
import { BpmService, DmsObject, DmsService, TaskData } from '@yuuvis/core';
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
  processData$: Observable<ResponsiveTableData> = this.bpmService
    .getTasks()
    .pipe(map((val: TaskData[]) => this.formatProcessDataService.formatTaskDataForTable(val)));

  constructor(
    private dmsService: DmsService,
    private formatProcessDataService: FormatProcessDataService,
    private bpmService: BpmService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, process, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getSelectedDetail(businessKey: string) {
    this.dmsObject$ = this.dmsService.getDmsObject(businessKey).pipe(tap((val) => (this.itemIsSelected = true)));
  }

  refreshList() {
    // this.bpmService. ().subscribe();
  }
  selectedItem(item) {
    console.log({ item });

    // this.getSelectedDetail(item[0].businessKey);
  }
}
