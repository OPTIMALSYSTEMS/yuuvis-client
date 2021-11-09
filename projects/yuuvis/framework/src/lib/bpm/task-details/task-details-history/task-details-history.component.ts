import { Component, Input, OnInit } from '@angular/core';
import { BpmService, ProcessInstanceHistoryEntry, TranslateService } from '@yuuvis/core';

@Component({
  selector: 'yuv-task-details-history',
  templateUrl: './task-details-history.component.html',
  styleUrls: ['./task-details-history.component.scss']
})
export class TaskDetailsHistoryComponent implements OnInit {
  @Input() set processInstanceId(pid: string) {
    if (pid) {
      this.fetchProcessHistory(pid);
    } else {
      this.entries = [];
    }
  }

  busy: boolean;
  error: any;
  entries: ProcessInstanceHistoryEntry[] = [];

  constructor(private bpmService: BpmService, private translate: TranslateService) {}

  private fetchProcessHistory(processInstanceId: string) {
    this.error = null;
    this.busy = true;
    this.bpmService.getProcessHistory(processInstanceId).subscribe(
      (res) => {
        this.entries = res;
        this.busy = false;
      },
      (err) => {
        console.error(err);
        this.error = err;
        this.busy = false;
      }
    );
  }

  ngOnInit(): void {}
}
