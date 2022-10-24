import { Injectable } from '@angular/core';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { expand, map, skipWhile, tap } from 'rxjs/operators';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../user/user.service';
import { ProcessAction, ProcessPostPayload, Task } from '../model/bpm.model';
import { BpmService } from './../bpm/bpm.service';

/**
 * InboxService: responsible for handling all bpm/tasks route related interactions
 * facade for BpmService
 */
@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private INBOX_PAGE_SIZE = 100;

  private inboxData: Task[] = [];
  private inboxDataSource = new ReplaySubject<Task[]>(1);
  public inboxData$: Observable<Task[]> = this.inboxDataSource.asObservable();

  constructor(private bpmService: BpmService, private config: ConfigService, private userService: UserService, private backendService: BackendService) {}

  /**
   * bpm Inbox data Loading status
   */
  get loadingInboxData$(): Observable<boolean> {
    return this.bpmService.loadingBpmData$;
  }

  getTaskForm(formKey: string): any {
    return this.backendService.get(`/resources/config/${formKey}`).pipe(map((res) => (res ? res.tenant : null)));
  }

  /**
   * updates inboxData$
   */
  fetchTasks(includeProcessVar = true, briefRepresentation = true): void {
    this.getTasksPaged({ includeProcessVariables: includeProcessVar, briefRepresentation })
      .pipe(
        tap((res: Task[]) => {
          this.inboxData = [...res.reverse()];
          this.inboxDataSource.next(this.inboxData);
        })
      )
      .subscribe();
  }

  reEmitInboxData() {
    this.inboxDataSource.next(this.inboxData);
  }

  private getTasksPaged(options?: { active?: boolean; includeProcessVariables?: boolean; processInstanceId?: string; briefRepresentation?: boolean }) {
    let p = [];
    Object.keys(options).forEach((k) => {
      p.push(`${k}=${options[k]}`);
    });
    return this.getAllPages(`&${p.join('&')}`);
  }

  private getAllPages(requestParams: string): Observable<Task[]> {
    let items = [];
    let i = 0;
    return this.getPage(requestParams, i).pipe(
      expand((res: any) => {
        i++;
        return res.hasMoreItems ? this.getPage(requestParams, i) : EMPTY;
      }),
      tap((res: any) => (items = [...items, ...res.objects])),
      skipWhile((res: any) => res.hasMoreItems),
      map((_) => items)
    );
  }

  private getPage(requestParams: string, index?: number) {
    const pageSize = this.config.get('core.app.inboxPageSize') || this.INBOX_PAGE_SIZE;
    return this.bpmService.getProcesses(`/bpm/tasks?size=${pageSize}&sort=createTime&page=${index || 0}${requestParams}`, true);
  }

  /**
   * get a specific task by processInstanceId
   */
  getTask(processInstanceId: string, includeProcessVar = true): Observable<Task> {
    return this.bpmService
      .getProcesses(`/bpm/tasks/${processInstanceId}${includeProcessVar ? '?includeProcessVariables=true' : ''}`, true)
      .pipe(map((res) => res as Task));
  }

  /**
   * Finsihes a task.
   * @param taskId ID of the taks to finish
   * @param payload Data to be send with the complete request (may contain attachments, a new subject or variables)
   */
  completeTask(taskId: string, payload?: ProcessPostPayload): Observable<any> {
    return this.putTask(taskId, ProcessAction.complete, payload || {});
  }

  /**
   * Claim or unclaim a task.
   * @param taskId ID of the taks to (un)claim
   * @param claim Whether or not to claim (true) or unclaim (false)
   */
  claimTask(taskId: string, claim: boolean): Observable<Task> {
    const payload: any = {
      assignee: claim ? { id: this.userService.getCurrentUser().id } : null
    };
    const pl = { ...payload, action: ProcessAction.claim };
    return this.backendService.put(`/bpm/tasks/${taskId}`, pl || {}, ApiBase.apiWeb).pipe(
      tap((updatedTask: Task) => {
        // update tasklist after claiming without actually fetching it again
        const idx = this.inboxData.findIndex((t) => t.id === updatedTask.id);
        if (idx !== -1) {
          this.inboxData[idx] = { ...updatedTask };
          this.inboxDataSource.next([...this.inboxData]);
        }
      })
    );
  }

  /**
   * Delegates a task to a new assignee
   * @param taskId ID of the task to be delegated
   * @param assignee ID of the new assignee
   */
  delegateTask(taskId: string, assignee: string, payload?: ProcessPostPayload): Observable<Task> {
    return this.putTask(taskId, ProcessAction.delegate, { ...(payload || {}), ...{ assignee: { id: assignee } } });
  }

  /**
   * Resolves a task that has been delegated
   * @param taskId ID of the task to be resolved
   * @param payload Data to be send with the resolve request (may contain attachments, a new subject or variables)
   */
  resolveTask(taskId: string, payload?: ProcessPostPayload): Observable<Task> {
    return this.putTask(taskId, ProcessAction.resolve, payload || {});
  }

  /**
   * Updates a task.
   * @param taskId ID of the taks to be updated
   * @param payload Data to be send with the complete request (may contain attachments, a new subject or variables)
   */
  updateTask(
    taskId: string,
    payload?: ProcessPostPayload,
    options?: {
      includeProcessVar: boolean;
      briefRepresentation: boolean;
    }
  ): Observable<any> {
    return this.putTask(taskId, ProcessAction.save, payload || {}, options);
  }

  private putTask(
    taskId: string,
    action: string,
    payload: ProcessPostPayload,
    options?: {
      includeProcessVar: boolean;
      briefRepresentation: boolean;
    }
  ) {
    const pl = { ...payload, action: action };
    return this.backendService
      .put(`/bpm/tasks/${taskId}`, pl, ApiBase.apiWeb)
      .pipe(tap((_) => (options ? this.fetchTasks(options.includeProcessVar, options.briefRepresentation) : this.fetchTasks())));
  }
}
