import { Component, OnDestroy, OnInit } from '@angular/core';
import { InboxService, Task } from '@yuuvis/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { Task1, Task2 } from './task.data';

@Component({
  selector: 'yuv-test-task-details',
  templateUrl: './test-task-details.component.html',
  styleUrls: ['./test-task-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestTaskDetailsComponent implements OnInit, OnDestroy {
  private tasks = [Task1, Task2];
  task: Task = Task1;
  allTasks: Task[] = [];

  constructor(private inboxService: InboxService) {
    this.inboxService.inboxData$.pipe(takeUntilDestroy(this)).subscribe((res) => (this.allTasks = res));
  }

  setTask(idx: number) {
    this.task = this.tasks[idx];
  }

  setEmptyTask() {
    this.task = null;
  }

  completeAllTasks() {
    if (this.allTasks.length) {
      forkJoin(
        this.allTasks.map((t) =>
          this.inboxService.completeTask(t.id).pipe(
            catchError((e) => {
              console.error(e);
              return of(null);
            })
          )
        )
      ).subscribe();
    }
  }

  ngOnInit(): void {
    this.inboxService.fetchTasks();
  }

  ngOnDestroy() {}
}
