import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaskData, TaskDataResponse } from '../model/bpm.model';
import { BpmService } from './../bpm/bpm.service';

/**
 * InboxService: responsible for handling all bpm/tasks route related interactions
 * facade for BpmService
 */
@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private readonly bpmTaskUrl = '/bpm/tasks';
  private inboxDataSource = new Subject<TaskData[]>();
  public inboxData$: Observable<TaskData[]> = this.inboxDataSource.asObservable();

  constructor(private bpmService: BpmService) {}

  /**
   * bpm Inbox data Loading status
   */
  get loadingInboxData$(): Observable<boolean> {
    return this.bpmService.loadingBpmData$;
  }

  /**
   * get all Inbox tasks
   */
  getTasks(includeProcessVar = true): Observable<TaskData[]> {
    return this.bpmService.getProcesses(`${this.bpmTaskUrl}?active=true&includeProcessVariables=${includeProcessVar}`).pipe(
      tap(({ data }: TaskDataResponse) => this.inboxDataSource.next(data)),
      map(({ data }: TaskDataResponse) => data)
    );
  }

  /**
   * get a specific task by processInstanceId
   */
  getTask(processInstanceId: string, includeProcessVar = true): Observable<TaskData[]> {
    return this.bpmService
      .getProcesses(`${this.bpmTaskUrl}?active=true&includeProcessVariables=${includeProcessVar}&processInstanceId=${processInstanceId}`)
      .pipe(map(({ data }: TaskDataResponse) => data));
  }

  /**
   * set task status to comlete
   */
  completeTask(taskId: string): Observable<any> {
    return this.bpmService.updateProcess(`${this.bpmTaskUrl}/${taskId}`, { action: 'complete' });
  }
  // updateTask(taskId: string, payload: any): Observable<any> {
  //   return this.bpmService.createProcess(url, payload);
  // }
}
