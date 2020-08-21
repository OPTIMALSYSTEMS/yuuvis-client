import { Injectable } from '@angular/core';
import { BackendService } from '../backend/backend.service';

@Injectable({
  providedIn: 'root'
})
export class BpmService {
  private readonly bpmUrl = '/bpm/process/instances';
  constructor(private backendService: BackendService) {}

  // getProcessInstances(processDefKey: ProcessDefinitionKey, businessKey?: string, includeProcessVar = true): Observable<ProcessData[]> {
  //   const businessKeyValue = businessKey ? `&businessKey=${businessKey}` : '';
  //   return this.backendService
  //     .get(`${this.bpmUrl}?processDefinitionKey=${processDefKey}&includeProcessVariables=${includeProcessVar}${businessKeyValue}`, ApiBase.apiWeb)
  //     .pipe(map(({ data }: ProcessDataResponse) => data));
  // }

  // createProcessInstance(payload: ProcessInstance): Observable<ProcessData> {
  //   return this.backendService.post(this.bpmUrl, payload, ApiBase.apiWeb);
  // }

  // deleteDmsObject(processInstanceId: string): Observable<any> {
  //   return this.backendService.delete(`${this.bpmUrl}/${processInstanceId}`, ApiBase.apiWeb);

  // getFollowUp(documentId: string): Observable<any> {
  //   const url = `/bpm/process/instances?processDefinitionKey=follow-up&businessKey=${documentId}`;
  //   return this.backend.get(url, ApiBase.apiWeb).pipe(map((res) => res.data[0]));
  // }

  // createFollowUp(documentId: string, expiryDateTime: string, whatAbout?: string): Observable<any> {
  //   let payload = {
  //     processDefinitionKey: 'follow-up',
  //     name: 'follow-up',
  //     businessKey: documentId,
  //     startFormVariables: [
  //       {
  //         name: 'expiryDateTime',
  //         value: expiryDateTime
  //       },
  //       {
  //         name: 'whatAbout',
  //         value: whatAbout
  //       }
  //     ]
  //   };
  //   return this.backend.post(`/bpm/process/instances`, payload, ApiBase.apiWeb);
  // }

  // editFollowUp(documentId: string, processInstanceId: string, expiryDateTime: string, whatAbout: string): Observable<any> {
  //   return this.deleteFollowUp(processInstanceId).pipe(flatMap(() => this.createFollowUp(documentId, expiryDateTime, whatAbout)));
  // }

  // deleteFollowUp(processInstanceId: string): Observable<any> {
  //   return this.backend.delete(`/bpm/process/instances/${processInstanceId}`);
  // }
}
