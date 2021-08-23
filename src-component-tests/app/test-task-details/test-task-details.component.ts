import { Component, OnInit } from '@angular/core';
import { Task } from '@yuuvis/core';
import { TaskData1, TaskData2 } from './task.data';

@Component({
  selector: 'yuv-test-task-details',
  templateUrl: './test-task-details.component.html',
  styleUrls: ['./test-task-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestTaskDetailsComponent implements OnInit {
  private tasks = [TaskData1, TaskData2];
  task: Task = new Task(TaskData1);

  constructor() {}

  setTask(idx: number) {
    this.task = new Task(this.tasks[idx]);
  }

  setEmptyTask() {
    this.task = null;
  }

  ngOnInit(): void {}
}
