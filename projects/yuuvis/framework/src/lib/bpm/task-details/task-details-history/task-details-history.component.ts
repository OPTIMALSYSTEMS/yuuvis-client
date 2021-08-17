import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-task-details-history',
  templateUrl: './task-details-history.component.html',
  styleUrls: ['./task-details-history.component.scss']
})
export class TaskDetailsHistoryComponent implements OnInit {
  @Input() set processInstanceId(pid: string) {
    this.fetchProcessHistory(pid);
  }

  constructor() {}

  private fetchProcessHistory(processInstanceId: string) {}

  ngOnInit(): void {}
}
