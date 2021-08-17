import { Component, Input, OnInit } from '@angular/core';
import { InboxService, Task } from '@yuuvis/core';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  @Input() task: Task;

  constructor(private inboxService: InboxService) {}

  confirm() {
    this.inboxService.completeTask(this.task.id).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  ngOnInit(): void {}
}
