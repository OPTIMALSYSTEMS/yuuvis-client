import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ProcessDefinitionKey, TaskData, TaskDataResponse } from '../model/bpm.model';
import { BpmService } from './../bpm/bpm.service';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private readonly bpmTaskUrl = '/bpm/tasks';
  private inboxDataSource = new Subject<TaskData[]>();
  public inboxData$: Observable<TaskData[]> = this.inboxDataSource.asObservable();

  constructor(private bpmService: BpmService) {}

  getTasks(processDefKey: ProcessDefinitionKey, includeProcessVar = true): Observable<TaskData[]> {
    // return this.bpmService.getProcessInstances(processDefKey, includeProcessVar).pipe(tap((vlas) => this.inboxDataSource.next(vlas)));
    return this.bpmService.getProcesses(`${this.bpmTaskUrl}?active=true&includeProcessVariables=${includeProcessVar}`).pipe(
      tap((val) => console.log({ val })),
      map(({ data }: TaskDataResponse) => data)
    );
  }

  // updateTask(taskId: string, payload: any): Observable<any> {
  //   return this.bpmService.createProcess(url, payload);
  // }
}
