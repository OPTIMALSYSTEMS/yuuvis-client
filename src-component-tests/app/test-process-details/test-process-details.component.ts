import { Component, OnInit } from '@angular/core';
import { Process, ProcessRow, ProcessService } from '@yuuvis/core';
import { FormatProcessDataService } from '@yuuvis/framework';
import { map } from 'rxjs/operators';

@Component({
  selector: 'yuv-test-process-details',
  templateUrl: './test-process-details.component.html',
  styleUrls: ['./test-process-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestProcessDetailsComponent implements OnInit {
  processData$ = this.processService.processData$.pipe(
    map((processData: Process[]) => this.formatProcessDataService.formatProcessDataForTable(processData, ['type', 'subject', 'startTime', 'status', 'endTime']))
  );

  selectedProcess: Process;
  displayVars = ['email'];

  constructor(private processService: ProcessService, private formatProcessDataService: FormatProcessDataService) {}

  selectedItem(items: ProcessRow[]) {
    this.selectedProcess = items?.length ? items[0].originalData : null;
  }

  refreshList() {
    this.processService.fetchProcesses();
  }

  onStatusFilterChange(e) {}

  ngOnInit(): void {
    this.processService.fetchProcesses();
  }
}
