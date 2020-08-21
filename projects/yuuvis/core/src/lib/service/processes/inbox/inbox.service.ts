import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InboxPayload, ProcessData, ProcessDefinitionKey } from '../model/bpm.model';
import { BpmService } from './../bpm/bpm.service';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  constructor(private bpmService: BpmService) {}

  getInbox(processDefKey: ProcessDefinitionKey, includeProcessVar = true): Observable<ProcessData[]> {
    return this.bpmService.getProcessInstances(processDefKey, includeProcessVar);
  }

  getInboxById(businessKey: string, processDefKey: ProcessDefinitionKey, includeProcessVar = true): Observable<ProcessData> {
    return this.bpmService.getProcessInstance(processDefKey, businessKey, includeProcessVar);
  }

  createInboxItem(payload: InboxPayload) {
    return this.bpmService.createProcess(payload);
  }

  deleteInboxItem(processInstanceId: string) {
    return this.bpmService.deleteProcess(processInstanceId);
  }
}
