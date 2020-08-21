import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';

@Injectable({
  providedIn: 'root'
})
export class BpmService {
  constructor(private backend: BackendService) {}

  getFollowUp(documentId: string): Observable<any> {
    const url = `/bpm/process/instances?processDefinitionKey=follow-up&businessKey=${documentId}`;
    return this.backend.get(url, ApiBase.apiWeb).pipe(map((res) => res.data[0]));
  }

  createFollowUp(documentId: string, expiryDateTime: string, whatAbout?: string): Observable<any> {
    let payload = {
      processDefinitionKey: 'follow-up',
      name: 'follow-up',
      businessKey: documentId,
      startFormVariables: [
        {
          name: 'expiryDateTime',
          value: expiryDateTime
        },
        {
          name: 'whatAbout',
          value: whatAbout
        }
      ]
    };
    return this.backend.post(`/bpm/process/instances`, payload, ApiBase.apiWeb);
  }

  editFollowUp(documentId: string, processInstanceId: string, expiryDateTime: string, whatAbout: string): Observable<any> {
    return this.deleteFollowUp(processInstanceId).pipe(flatMap(() => this.createFollowUp(documentId, expiryDateTime, whatAbout)));
  }

  deleteFollowUp(processInstanceId: string): Observable<any> {
    return this.backend.delete(`/bpm/process/instances/${processInstanceId}`);
  }
}
