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
  private tasks: string[] = [];
  private tasksSource = new ReplaySubject<string[]>();
  public tasks$: Observable<string[]> = this.tasksSource.asObservable();

  private customMsg = '';
  private defaultMsg = 'You are currently editing the index data of a form that has not been saved. Unsaved data will be lost.';

  constructor(private logger: Logger) {}

  /**
   * Registers a task to be pending.
   * @returns Unique id to be used for finishing this task
   */
  startTask(): string {
    const taskId = Utils.uuid();
    this.tasks.push(taskId);
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
      this.tasks = this.tasks.filter(t => t !== id);
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
    return !id ? !!this.tasks.length : Array.isArray(id) ? this.tasks.some(value => id.includes(value)) : this.tasks.includes(id);
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
      const confirmed = confirm(this.customMsg || this.defaultMsg);
      if (confirmed) {
        this.clear();
      }
      return !confirmed;
    }
  }

  checkForPendingTasks(taskIds: string | string[]): boolean {
    if (this.hasPendingTask(taskIds)) {
      const confirmed = confirm(this.customMsg || this.defaultMsg);
      if (confirmed) {
        this.clear();
      }
      return !confirmed;
    } else {
      return false;
    }
  }

  /**
   * Clear list of pending tasks
   */
  clear() {
    this.tasks = [];
    this.tasksSource.next(this.tasks);
  }

  /**
   * Enables to set localized message for window alert
   * @param message that appears inside window alert
   */
  setCustomMessage(message: string) {
    this.customMsg = message;
  }
}
