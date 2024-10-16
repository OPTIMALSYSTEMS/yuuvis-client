import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InboxService, Task } from '@yuuvis/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  disableBriefRepresentation = this.inboxService.disableBriefRepresentation;

  constructor(private inboxService: InboxService) {
    this.inboxService.inboxData$.pipe(takeUntilDestroyed()).subscribe((res) => (this.allTasks = res));
  }

  refreshList() {
    this.inboxService.fetchTasks();
  }

  setTask(idx: number) {
    this.task = this.tasks[idx];
  }

  setEmptyTask() {
    this.task = null;
  }

  toggleBriefRepresenation() {
    this.disableBriefRepresentation = !this.inboxService.disableBriefRepresentation;
    this.inboxService.disableBriefRepresentation = this.disableBriefRepresentation;
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

  ngOnDestroy() { }
}
