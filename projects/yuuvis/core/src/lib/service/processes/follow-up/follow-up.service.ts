import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { BpmService } from '../bpm/bpm.service';
import { ProcessData, ProcessDefinitionKey } from '../model/bpm.model';

interface CreateFollowUp {
  expiryDateTime: Date;
  whatAbout: string;
}

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  constructor(private bpmService: BpmService) {}

  getFollowUp(businessKey: string): Observable<ProcessData> {
    return this.bpmService.getProcessInstance(ProcessDefinitionKey.FOLLOW_UP, businessKey);
  }

  createFollowUp(documentId: string, payload: CreateFollowUp): Observable<any> {
    console.log();

    const payloadData: any = {
      processDefinitionKey: ProcessDefinitionKey.FOLLOW_UP,
      name: ProcessDefinitionKey.FOLLOW_UP,
      businessKey: documentId,
      startFormVariables: Object.keys(payload).map((value) => ({ name: value, value: payload[value] }))
    };
    return this.bpmService.createProcess(payloadData);
  }

  editFollowUp(documentId: string, processInstanceId: string, payload: CreateFollowUp): Observable<any> {
    return this.bpmService.deleteProcess(processInstanceId).pipe(flatMap(() => this.createFollowUp(documentId, payload)));
  }

  deleteFollowUp(processId: string) {
    return this.bpmService.deleteProcess(processId);
  }
}
