import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Utils } from '../../util/utils';
import { Logger } from '../logger/logger';
import { PendingChangesComponent } from './pending-changes-component.interface';

/**
 * EditingObserver service is used to track changes made inside the application, that should prevent
 * doing something or going somewhere before the changes are persisted or ignored. For example when
 * the user starts editing form data and tries to navigate away before saving the changes, this service
 * will take care of notifying the user.
 *
 * It is working kind of like a registry for ongoing tasks that need to be monitored. Every component
 * that needs to be aware of changes to be persisted can start a task and finish it when everything is done.
 *
 * Other components can ask the service for pending tasks to know whether or not to execute an action
 * (e.g. list component will subscribe and prevent selecting another list item, if changes to the previous one haven't be finished)
 *
 * app.component will prevent relevant route changes while tasks are pending.
 */

@Injectable({
  providedIn: 'root'
})
export class PendingChangesService {
  private tasks: { id: string; message?: string }[] = [];
  private tasksSource = new ReplaySubject<{ id: string; message?: string }[]>();
  public tasks$: Observable<{ id: string; message?: string }[]> = this.tasksSource.asObservable();

  // private customMsg = '';
  private defaultMsg = 'You are currently editing the index data of a form that has not been saved. Unsaved data will be lost.';
  /**
   * @ignore
   */
  constructor(private logger: Logger) {}

  /**
   * Registers a task to be pending.
   * @returns Unique id to be used for finishing this task
   */
  startTask(message?: string): string {
    const taskId = Utils.uuid();
    this.tasks.push({ id: taskId, message: message });
    this.logger.debug('started pending task: ' + taskId);
    this.tasksSource.next(this.tasks);
    return taskId;
  }

  /**
   * Finishes a task
   * @param id The id of the task to be finished. This is the one the component got from startTask()
   */
  finishTask(id: string) {
    if (id) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.tasksSource.next(this.tasks);
      this.logger.debug('finished pending task: ' + id);
    }
  }

  /**
   * Returns whether or not the service has pending tasks.
   * If an id is provided, the method will check existence of one specific task.
   *
   * @param id The id of the task to be checked
   * @returns
   */
  hasPendingTask(id?: string | string[]): boolean {
    return !id ? !!this.tasks.length : Array.isArray(id) ? this.tasks.some((value) => id.includes(value.id)) : this.tasks.map((t) => t.id).includes(id);
  }

  /**
   * Returns whether or not the component|service has pending tasks.
   * Checks via confirm dialog
   * @param component
   * @returns
   */
  check(component?: PendingChangesComponent): boolean {
    if (component && component.hasPendingChanges ? !component.hasPendingChanges() : !this.hasPendingTask()) {
      return false;
    } else {
      const confirmed = confirm(this.getConfirmMessage());
      if (confirmed) {
        this.clear();
      }
      return !confirmed;
    }
  }

  checkForPendingTasks(taskIds: string | string[]): boolean {
    if (this.hasPendingTask(taskIds)) {
      const confirmed = confirm(this.getConfirmMessage());
      if (confirmed) {
        this.clear();
      }
      return !confirmed;
    } else {
      return false;
    }
  }

  private getConfirmMessage(): string {
    let msg = '';
    this.tasks.forEach((t) => {
      // do not apply messages twice
      if (msg.indexOf(t.message || this.defaultMsg) === -1) {
        msg = `${msg}${msg.length > 0 ? '\n---\n' : ''}${t.message || this.defaultMsg}`;
      }
    });
    return msg;
  }

  /**
   * Clear list of pending tasks
   */
  clear() {
    this.tasks = [];
    this.tasksSource.next(this.tasks);
  }
}
