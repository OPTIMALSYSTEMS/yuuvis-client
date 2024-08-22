import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { expand, map, skipWhile, switchMap, tap } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { BpmService } from '../bpm/bpm.service';
import { FetchProcessOptions, FetchTaskOptions, FollowUpVars, Process, ProcessCreatePayload, ProcessDefinitionKey, Task } from '../model/bpm.model';

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
  readonly #bpmService = inject(BpmService);
  readonly #config = inject(ConfigService)

  private PROCESSES_PAGE_SIZE = 100;

  private readonly bpmProcessUrl = '/bpm/processes';

  private processData: Process[] = [];
  private processSource = new BehaviorSubject<Process[]>([]);
  public processData$: Observable<Process[]> = this.processSource.asObservable();


  /**
   * bpm Process data Loading status
   */
  get loadingProcessData$(): Observable<boolean> {
    return this.#bpmService.loadingBpmData$;
  }

  /**
   * get all processes
   */
  fetchProcesses(processDefinitionKey?: string, options?: FetchProcessOptions): void {
    const defaultOptions: any = {
      includeProcessVariables: true,
      sort: 'startTime'
    };

    if (processDefinitionKey) {
      defaultOptions['processDefinitionKey'] = processDefinitionKey;
    }
    const mergedOptions = { ...defaultOptions, ...options };
    const params = Object.keys(mergedOptions).map((k) => `${k}=${mergedOptions[k]}`);
    this.getAllPages(params.join('&'))
      .pipe(
        tap((res: Process[]) => {
          this.processData = [...res.reverse()];
          this.processSource.next(this.processData);
        })
      )
      .subscribe();
  }

  reEmitProcessData() {
    this.processSource.next(this.processData);
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
    const pageSize = this.#config.get('core.app.processesPageSize') || this.PROCESSES_PAGE_SIZE;

    return this.#bpmService.getProcesses(`${this.bpmProcessUrl}?size=${pageSize}&page=${index || 0}&${requestParams}`);
  }

  /**
   * get a specific follow Up by bisinessKey
   */
  getFollowUp(businessKey: string, options?: FetchTaskOptions): Observable<Process> {
    return this.#bpmService.getProcessInstance(ProcessDefinitionKey.FOLLOW_UP, { ...options, businessKey });
  }

  getFollowUpTask(objectId: string): Observable<Task> {
    return this.#bpmService.getProcesses(`/bpm/tasks?businessKey=${objectId}&processDefinitionKey=${ProcessDefinitionKey.FOLLOW_UP}`).pipe(
      map((res: any) => {
        const tasks = res.objects as Task[];
        return tasks.length ? tasks[0] : null;
      })
    );
  }

  /**
   * create a follow Up for a document
   */
  createFollowUp(documentId: string, subject: string, expiryDateTime: string): Observable<any> {
    return this.#bpmService.createProcess(this.followUpPayloadData(documentId, subject, expiryDateTime));
  }

  private updateFollowUp(documentId: string, subject: string, expiryDateTime: string, processInstanceId: string): Observable<any> {
    const payloadData: ProcessCreatePayload = this.followUpPayloadData(documentId, subject, expiryDateTime);
    return this.#bpmService.createProcess(payloadData).pipe(
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
  editFollowUp(documentId: string, processInstanceId: string, subject: string, expiryDateTime: string): Observable<any> {
    return this.#bpmService
      .deleteProcess(this.bpmProcessUrl, processInstanceId)
      .pipe(switchMap(() => this.updateFollowUp(documentId, subject, expiryDateTime, processInstanceId)));
  }

  /**
   * delete a follow Up by process Instance Id
   */
  deleteProcess(processInstanceId: string) {
    return this.#bpmService.deleteProcess(this.bpmProcessUrl, processInstanceId).pipe(
      tap((data) => {
        let currentValue = this.processSource.getValue();
        if (currentValue) {
          currentValue = currentValue.filter((value) => value.id !== processInstanceId);
          this.processSource.next(currentValue);
        }
      })
    );
  }

  private followUpPayloadData(documentId: string, subject: string, expiryDateTime: string): ProcessCreatePayload {
    return {
      processDefinitionKey: ProcessDefinitionKey.FOLLOW_UP,
      businessKey: documentId,
      variables: [
        {
          name: FollowUpVars.expiryDateTime,
          type: 'date',
          value: expiryDateTime
        }
      ],
      subject,
      attachments: [documentId]
    };
  }
}
