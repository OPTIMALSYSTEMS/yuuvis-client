import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { expand, map, skipWhile, tap } from 'rxjs/operators';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
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

  private inboxDataSource = new Subject<Task[]>();
  public inboxData$: Observable<Task[]> = this.inboxDataSource.asObservable();

  constructor(private bpmService: BpmService, private userService: UserService, private backendService: BackendService) {}

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
  fetchTasks(includeProcessVar = true): void {
    this.getTasksPaged({ includeProcessVariables: includeProcessVar })
      .pipe(
        tap((res: Task[]) => this.inboxDataSource.next(res.reverse())),
        map((res: Task[]) => res)
      )
      .subscribe();
  }

  private getTasksPaged(options?: { active?: boolean; includeProcessVariables?: boolean; processInstanceId?: string }) {
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
    return this.bpmService.getProcesses(`/bpm/tasks?size=${this.INBOX_PAGE_SIZE}&sort=createTime&page=${index || 0}${requestParams}`);
  }

  /**
   * get a specific task by processInstanceId
   */
  getTask(processInstanceId: string, includeProcessVar = true): Observable<Task> {
    return this.bpmService
      .getProcesses(`/bpm/tasks/${processInstanceId}${includeProcessVar ? '?includeProcessVariables=true' : ''}`)
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
    return this.putTask(taskId, ProcessAction.claim, payload || {});
  }

  /**
   * Delegates a task to a new assignee
   * @param taskId ID of the task to be delegated
   * @param assignee ID of the new assignee
   */
  delegateTask(taskId: string, assignee: string): Observable<Task> {
    const payload: any = {
      assignee: { id: assignee }
    };
    return this.putTask(taskId, ProcessAction.delegate, payload || {});
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
  updateTask(taskId: string, payload?: ProcessPostPayload): Observable<any> {
    return this.putTask(taskId, ProcessAction.save, payload || {});
  }

  private putTask(taskId: string, action: string, payload: ProcessPostPayload) {
    const pl = { ...payload, action: action };
    return this.backendService.put(`/bpm/tasks/${taskId}`, pl, ApiBase.apiWeb).pipe(tap((_) => this.fetchTasks()));
  }
}
