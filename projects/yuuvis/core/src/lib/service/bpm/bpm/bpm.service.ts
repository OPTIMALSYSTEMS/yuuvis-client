import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
import { ProcessData, ProcessDefinitionKey, ProcessInstance, ProcessResponse, TaskData, TaskDataResponse } from '../model/bpm.model';

@Injectable({
  providedIn: 'root'
})
export class BpmService {
  private readonly bpmProcessUrl = '/bpm/process/instances';
  private readonly bpmTaskUrl = '/bpm/tasks';
  constructor(private backendService: BackendService) {}

  getProcesses(url: string): Observable<unknown> {
    return this.backendService.get(url);
  }

  getProcessInstances(processDefKey: ProcessDefinitionKey, includeProcessVar = true): Observable<ProcessData[]> {
    return this.backendService.get(`${this.bpmProcessUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}`, ApiBase.apiWeb);
  }

  getProcessInstance(processDefKey: ProcessDefinitionKey, businessKey: string, includeProcessVar = true): Observable<ProcessData> {
    const businessKeyValue = businessKey ? `&businessKey=${businessKey}` : '';
    return this.backendService
      .get(`${this.bpmProcessUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}${businessKeyValue}`, ApiBase.apiWeb)
      .pipe(map(({ data }: ProcessResponse) => data[0]));
  }

  createProcess(payload: ProcessInstance): Observable<ProcessResponse> {
    return this.backendService.post(this.bpmProcessUrl, payload, ApiBase.apiWeb);
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
      map(({ data }: TaskDataResponse) => data)
    );
  }

  getTask(processInstanceId: string, businessKey?: string): Observable<TaskData> {
    return this.backendService
      .get(`${this.bpmTaskUrl}?active=true&includeProcessVariables=true&businessKey=${businessKey}&processInstanceId=${processInstanceId}`)
      .pipe(map(({ data }: TaskDataResponse) => data[0]));
  }
}
