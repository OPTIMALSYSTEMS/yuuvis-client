import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BpmService } from '../bpm/bpm.service';
import { ProcessDefinitionKey, ProcessInstance, ProcessResponse } from '../model/bpm.model';
import { ProcessData } from './../model/bpm.model';

interface CreateFollowUp {
  expiryDateTime: Date;
  whatAbout: string;
  documentId: string;
}

/**
 * ProcessService: responsible for handling all bpm/process/instances route related interactions
 * facade for BpmService
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private readonly bpmProcessUrl = '/bpm/process/instances';

  private processSource = new BehaviorSubject<ProcessData[]>([]);
  public processData$: Observable<ProcessData[]> = this.processSource.asObservable();

  constructor(private bpmService: BpmService) {}

  /**
   * get all processes
   */
  getProcesses(): Observable<ProcessData[]> {
    return this.bpmService.getProcesses(`${this.bpmProcessUrl}?includeProcessVariables=true`).pipe(
      tap(({ data }: ProcessResponse) => this.processSource.next(data)),
      map(({ data }: ProcessResponse) => data)
    );
  }

  /**
   * get a specific follow Up by bisinessKey
   */
  getFollowUp(businessKey: string): Observable<ProcessData> {
    return this.bpmService.getProcessInstance(ProcessDefinitionKey.FOLLOW_UP, businessKey);
  }

  /**
   * create a follow Up for a document
   */
  createFollowUp(documentId: string, payload: CreateFollowUp): Observable<ProcessResponse> {
    const payloadData: ProcessInstance = this.followUpPayloadData(documentId, payload);
    return this.bpmService.createProcess(payloadData);
  }

  /** TODO: refactor once actual update is available below */

  private followUpPayloadData(documentId: string, payload: CreateFollowUp): ProcessInstance {
    return {
      processDefinitionKey: ProcessDefinitionKey.FOLLOW_UP,
      name: ProcessDefinitionKey.FOLLOW_UP,
      businessKey: documentId,
      variables: Object.keys(payload).map((value) => ({ name: value, value: payload[value] }))
    };
  }

  private updateFollowUp(documentId: string, payload: CreateFollowUp, processInstanceId: string): Observable<any> {
    const payloadData: ProcessInstance = this.followUpPayloadData(documentId, payload);
    return this.bpmService.createProcess(payloadData).pipe(
      tap((data) => {
        let currentValue = this.processSource.getValue();
        if (currentValue) {
          currentValue = currentValue.filter((value) => value.id !== processInstanceId);
          this.processSource.next([...currentValue, data]);
        }
      })
    );
  }
  /**
   * Edit/Update a follow Up by document and process Instance Id
   */
  /** TODO: refactor once actual update is available  above */
  editFollowUp(documentId: string, processInstanceId: string, payload: CreateFollowUp): Observable<any> {
    const deleteProcess = this.bpmService.deleteProcess(this.bpmProcessUrl, processInstanceId);
    const createProcess = this.updateFollowUp(documentId, payload, processInstanceId);
    return forkJoin([deleteProcess, createProcess]);
  }

  /**
   * delete a follow Up by process Instance Id
   */
  deleteFollowUp(processInstanceId: string) {
    return this.bpmService.deleteProcess(this.bpmProcessUrl, processInstanceId).pipe(
      tap((data) => {
        let currentValue = this.processSource.getValue();
        if (currentValue) {
          currentValue = currentValue.filter((value) => value.id !== processInstanceId);
          this.processSource.next(currentValue);
        }
      })
    );
  }
}
