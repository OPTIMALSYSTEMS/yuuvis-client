import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, flatMap, map, tap } from 'rxjs/operators';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
import { ProcessData, ProcessDefinitionKey, ProcessInstance, ProcessResponse, TaskData, TaskDataResponse } from '../model/bpm.model';

/**
 * BpmService: responsible for handling all bpm/ route related interactions
 */
@Injectable({
  providedIn: 'root'
})
export class BpmService {
  private readonly bpmProcessUrl = '/bpm/processes';
  private readonly bpmTaskUrl = '/bpm/tasks';

  private loadingBpmDataSource = new BehaviorSubject<boolean>(false);
  public loadingBpmData$: Observable<boolean> = this.loadingBpmDataSource.asObservable();

  constructor(private backendService: BackendService) {}

  getProcesses(url: string): Observable<unknown> {
    this.loadingBpmDataSource.next(true);
    return this.backendService.get(url).pipe(finalize(() => setTimeout(() => this.loadingBpmDataSource.next(false), 200)));
  }

  getProcessInstances(processDefKey: ProcessDefinitionKey, includeProcessVar = true): Observable<ProcessData[]> {
    return this.backendService.get(`${this.bpmProcessUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}`, ApiBase.apiWeb);
  }

  getProcessInstance(processDefKey: ProcessDefinitionKey, businessKey: string, includeProcessVar = true): Observable<ProcessData> {
    const businessKeyValue = businessKey ? `&businessKey=${businessKey}` : '';
    return this.backendService
      .get(`${this.bpmProcessUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}${businessKeyValue}`, ApiBase.apiWeb)
      .pipe(map(({ objects }: ProcessResponse) => objects[0]));
  }

  createProcess(payload: ProcessInstance): Observable<ProcessResponse> {
    return this.backendService.post(this.bpmProcessUrl, payload, ApiBase.apiWeb);
  }

  updateProcess(url: string, payload: any): Observable<any> {
    return this.backendService.post(url, payload, ApiBase.apiWeb);
  }

  editFollowUp(url: string, processInstanceId: string, payload: ProcessInstance): Observable<any> {
    return this.deleteProcess(url, processInstanceId).pipe(flatMap(() => this.createProcess(payload)));
  }

  deleteProcess(url, processInstanceId: string): Observable<any> {
    return this.backendService.delete(`${url}/${processInstanceId}`, ApiBase.apiWeb);
  }

  getTasks(): Observable<TaskData[]> {
    return this.backendService.get(`${this.bpmTaskUrl}?active=true&includeProcessVariables=true`).pipe(
      tap((val) => console.log({ val })),
      map(({ objects }: TaskDataResponse) => objects)
    );
  }

  getTask(processInstanceId: string, businessKey?: string): Observable<TaskData> {
    return this.backendService
      .get(`${this.bpmTaskUrl}?active=true&includeProcessVariables=true&businessKey=${businessKey}&processInstanceId=${processInstanceId}`)
      .pipe(map(({ objects }: TaskDataResponse) => objects[0]));
  }
}
