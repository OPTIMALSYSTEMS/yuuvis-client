import { Component, OnInit } from '@angular/core';
import { Task } from '@yuuvis/core';
import { Task1, Task2 } from './task.data';

@Component({
  selector: 'yuv-test-task-details',
  templateUrl: './test-task-details.component.html',
  styleUrls: ['./test-task-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestTaskDetailsComponent implements OnInit {
  private tasks = [Task1, Task2];
  task: Task = Task1;

  constructor() {}

  setTask(idx: number) {
    this.task = this.tasks[idx];
  }

  setEmptyTask() {
    this.task = null;
  }

  ngOnInit(): void {}
}
