import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { ProcessData, ProcessDataResponse, ProcessDefinitionKey, ProcessInstance } from './bpm.interface';

@Injectable({
  providedIn: 'root'
})
export class BpmService {
  private readonly bpmUrl = '/bpm/process/instances';
  constructor(private backendService: BackendService) {}

  getProcessInstances(processDefKey: ProcessDefinitionKey, businessKey?: string, includeProcessVar = true): Observable<ProcessData[]> {
    const businessKeyValue = businessKey ? `&businessKey=${businessKey}` : '';
    return this.backendService
      .get(`${this.bpmUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}${businessKeyValue}`, ApiBase.apiWeb)
      .pipe(map(({ data }: ProcessDataResponse) => data));
  }

  createProcessInstance(payload: ProcessInstance): Observable<ProcessData> {
    return this.backendService.post(this.bpmUrl, payload, ApiBase.apiWeb);
  }

  deleteDmsObject(processInstanceId: string): Observable<any> {
    return this.backendService.delete(`${this.bpmUrl}/${processInstanceId}`, ApiBase.apiWeb);
  }
}
