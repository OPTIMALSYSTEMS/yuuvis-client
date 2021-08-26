import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { expand, map, skipWhile, tap } from 'rxjs/operators';
import { Task } from '../model/bpm.model';
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

  constructor(private bpmService: BpmService) {}

  /**
   * bpm Inbox data Loading status
   */
  get loadingInboxData$(): Observable<boolean> {
    return this.bpmService.loadingBpmData$;
  }

  /**
   * updates inboxData$
   */
  fetchTasks(includeProcessVar = true): void {
    this.getTasksPaged({ includeProcessVariables: includeProcessVar })
      .pipe(
        tap((res: Task[]) => this.inboxDataSource.next(res)),
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
    return this.bpmService.getProcesses(`${this.bpmTaskUrl}?size=${this.INBOX_PAGE_SIZE}&page=${index || 0}${requestParams}`);
  }

  /**
   * get a specific task by processInstanceId
   */
  getTask(processInstanceId: string, includeProcessVar = true): Observable<Task[]> {
    return this.getTasksPaged({ includeProcessVariables: includeProcessVar, processInstanceId: processInstanceId }).pipe(map((res: Task[]) => res));
  }

  /**
   * set task status to comlete
   */
  completeTask(taskId: string): Observable<any> {
    return this.bpmService.updateProcess(`${this.bpmTaskUrl}/${taskId}`, { action: 'complete' }).pipe(tap((_) => this.fetchTasks()));
  }
  // updateTask(taskId: string, payload: any): Observable<any> {
  //   return this.bpmService.createProcess(url, payload);
  // }
}
