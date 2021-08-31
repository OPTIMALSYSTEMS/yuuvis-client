import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { expand, map, skipWhile, tap } from 'rxjs/operators';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
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

  private readonly bpmTaskUrl = '/bpm/tasks';
  private inboxDataSource = new Subject<Task[]>();
  public inboxData$: Observable<Task[]> = this.inboxDataSource.asObservable();

  constructor(private bpmService: BpmService, private backendService: BackendService) {}

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
    return this.bpmService.getProcesses(`${this.bpmTaskUrl}?size=${this.INBOX_PAGE_SIZE}&sort=createTime&page=${index || 0}${requestParams}`);
  }

  /**
   * get a specific task by processInstanceId
   */
  getTask(processInstanceId: string, includeProcessVar = true): Observable<Task[]> {
    return this.getTasksPaged({ includeProcessVariables: includeProcessVar, processInstanceId: processInstanceId }).pipe(map((res: Task[]) => res));
  }

  /**
   * Finsihes a task.
   * @param taskId ID of the taks to finish
   * @param payload Data to be send with the complete request (may contain attachments, a new subject or variables)
   */
  completeTask(taskId: string, payload?: ProcessPostPayload): Observable<any> {
    return this.postTask(taskId, ProcessAction.complete, payload || {});
  }

  /**
   * Updates a task.
   * @param taskId ID of the taks to be updated
   * @param payload Data to be send with the complete request (may contain attachments, a new subject or variables)
   */
  updateTask(taskId: string, payload?: ProcessPostPayload): Observable<any> {
    return this.postTask(taskId, ProcessAction.save, payload || {});
  }

  private postTask(taskId: string, action: string, payload: ProcessPostPayload) {
    const pl = { ...payload, action: action };
    return this.backendService.post(`${this.bpmTaskUrl}/${taskId}`, pl, ApiBase.apiWeb).pipe(tap((_) => this.fetchTasks()));
  }
}
