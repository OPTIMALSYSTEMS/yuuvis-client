import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, forkJoin, Observable } from 'rxjs';
import { expand, map, skipWhile, tap } from 'rxjs/operators';
import { BpmService } from '../bpm/bpm.service';
import { FollowUpVars, Process, ProcessCreatePayload, ProcessDefinitionKey } from '../model/bpm.model';

interface CreateFollowUpPayload {
  expiryDateTime: Date;
}

/**
 * ProcessService: responsible for handling all bpm/process/instances route related interactions
 * facade for BpmService
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private PROCESSES_PAGE_SIZE = 100;

  private readonly bpmProcessUrl = '/bpm/processes';

  private processSource = new BehaviorSubject<Process[]>([]);
  public processData$: Observable<Process[]> = this.processSource.asObservable();

  constructor(private bpmService: BpmService) {}

  /**
   * bpm Process data Loading status
   */
  get loadingProcessData$(): Observable<boolean> {
    return this.bpmService.loadingBpmData$;
  }

  /**
   * get all processes
   */
  getProcesses(processDefinitionKey?: string): Observable<Process[]> {
    let params = `&includeProcessVariables=true&sort=startTime`;
    if (processDefinitionKey) {
      params += `&processDefinitionKey=${processDefinitionKey}`;
    }
    return this.getAllPages(params).pipe(
      tap((res: Process[]) => this.processSource.next(res)),
      map((res: Process[]) => res.reverse())
    );
  }

  private getAllPages(requestParams: string): Observable<Process[]> {
    let items = [];
    let i = 0;
    return this.getPage(requestParams, i).pipe(
      expand((res: any) => {
        i++;
        return res.hasMoreItems ? this.getPage(requestParams, i) : EMPTY;
      }),
      tap((res: any) => (items = [...items, ...res.objects])),
      skipWhile((res: any) => res.hasMoreItems),
      map((_) => items)
    );
  }

  private getPage(requestParams: string, index?: number) {
    return this.bpmService.getProcesses(`${this.bpmProcessUrl}?size=${this.PROCESSES_PAGE_SIZE}&page=${index || 0}${requestParams}`);
  }

  /**
   * get a specific follow Up by bisinessKey
   */
  getFollowUp(businessKey: string): Observable<Process> {
    return this.bpmService.getProcessInstance(ProcessDefinitionKey.FOLLOW_UP, businessKey);
  }

  /**
   * create a follow Up for a document
   */
  createFollowUp(documentId: string, subject: string, expiryDateTime: Date): Observable<any> {
    return this.bpmService.createProcess(this.followUpPayloadData(documentId, subject, expiryDateTime));
  }

  private updateFollowUp(documentId: string, subject: string, expiryDateTime: Date, processInstanceId: string): Observable<any> {
    const payloadData: ProcessCreatePayload = this.followUpPayloadData(documentId, subject, expiryDateTime);
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
  editFollowUp(documentId: string, processInstanceId: string, subject: string, expiryDateTime: Date): Observable<any> {
    const deleteProcess = this.bpmService.deleteProcess(this.bpmProcessUrl, processInstanceId);
    const createProcess = this.updateFollowUp(documentId, subject, expiryDateTime, processInstanceId);
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

  private followUpPayloadData(documentId: string, subject: string, expiryDateTime: Date): ProcessCreatePayload {
    return {
      processDefinitionKey: ProcessDefinitionKey.FOLLOW_UP,
      businessKey: documentId,
      variables: [
        {
          name: FollowUpVars.expiryDateTime,
          type: 'date',
          value: expiryDateTime.toISOString()
        }
      ],
      subject,
      attachments: [documentId]
    };
  }
}
