import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { BpmService } from '../bpm/bpm.service';
import { ProcessData, ProcessDefinitionKey, ProcessResponse } from '../model/bpm.model';

interface CreateFollowUp {
  expiryDateTime: Date;
  whatAbout: string;
  documentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private readonly bpmProcessUrl = '/bpm/process/instances';
  constructor(private bpmService: BpmService) {}

  getProcesses(): Observable<ProcessData[]> {
    return this.bpmService.getProcesses(`${this.bpmProcessUrl}?includeProcessVariables=true`).pipe(
      tap((val) => console.log({ val })),
      map(({ data }: ProcessResponse) => data)
    );
  }

  getFollowUp(businessKey: string): Observable<ProcessData> {
    return this.bpmService.getProcessInstance(ProcessDefinitionKey.FOLLOW_UP, businessKey);
  }

  createFollowUp(documentId: string, payload: CreateFollowUp): Observable<any> {
    const payloadData: any = {
      processDefinitionKey: ProcessDefinitionKey.FOLLOW_UP,
      name: ProcessDefinitionKey.FOLLOW_UP,
      businessKey: documentId,
      variables: Object.keys(payload).map((value) => ({ name: value, value: payload[value] }))
    };
    return this.bpmService.createProcess(payloadData);
  }

  editFollowUp(documentId: string, processInstanceId: string, payload: CreateFollowUp): Observable<any> {
    return this.bpmService.deleteProcess(this.bpmProcessUrl, processInstanceId).pipe(flatMap(() => this.createFollowUp(documentId, payload)));
  }

  deleteFollowUp(processId: string) {
    return this.bpmService.deleteProcess(this.bpmProcessUrl, processId);
  }
}
