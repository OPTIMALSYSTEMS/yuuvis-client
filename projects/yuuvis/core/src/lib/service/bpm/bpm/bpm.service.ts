import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { expand, finalize, map, skipWhile, tap } from 'rxjs/operators';
import { Utils } from '../../../util/utils';
import { ApiBase } from '../../backend/api.enum';
import { BackendService } from '../../backend/backend.service';
import { SystemService } from '../../system/system.service';
import { FetchTaskOptions, Process, ProcessCreatePayload, ProcessDefinition, ProcessDefinitionKey, ProcessInstanceHistoryEntry } from '../model/bpm.model';

/**
 * BpmService: responsible for handling all bpm/ route related interactions
 */
@Injectable({
  providedIn: 'root'
})
export class BpmService {
  private readonly bpmProcessUrl = '/bpm/processes';
  // private readonly bpmTaskUrl = '/bpm/tasks';

  private loadingBpmDataSource = new BehaviorSubject<boolean>(false);
  public loadingBpmData$: Observable<boolean> = this.loadingBpmDataSource.asObservable();

  // TODO: Use later on to decide which processes could be started by the current user
  private availableProcessDefinitions: ProcessDefinition[] = [];

  public supports = {
    taskflow: false,
    followUp: false
  };

  constructor(private backendService: BackendService, private system: SystemService) {}

  // called on core init
  init() {
    // check availability of certain workflows
    this.getAllProcessDefinitions().subscribe((res: ProcessDefinition[]) => {
      this.availableProcessDefinitions = res;
      res.forEach((pd) => {
        if (pd.id.startsWith(ProcessDefinitionKey.TASK_FLOW)) {
          this.supports.taskflow = true;
        } else if (pd.id.startsWith(ProcessDefinitionKey.FOLLOW_UP)) {
          this.supports.followUp = true;
        }
      });
    });
  }

  private getAllProcessDefinitions(): Observable<ProcessDefinition[]> {
    let items = [];
    let i = 0;
    return this.getPage(i).pipe(
      expand((res: any) => {
        i++;
        return res.hasMoreItems ? this.getPage(i) : EMPTY;
      }),
      tap((res: any) => (items = [...items, ...res.objects])),
      skipWhile((res: any) => res.hasMoreItems),
      map((_) => items)
    );
  }

  private getPage(index?: number) {
    return this.backendService.get(`/bpm/process-definitions?page=${index || 0}`);
  }

  getProcesses(url: string): Observable<unknown> {
    this.loadingBpmDataSource.next(true);
    return this.backendService.get(url).pipe(finalize(() => setTimeout(() => this.loadingBpmDataSource.next(false), 200)));
  }

  getProcessInstances(processDefinitionKey: ProcessDefinitionKey, options: FetchTaskOptions = { includeProcessVar: true }): Observable<Process[]> {
    return this.backendService.get(`${this.bpmProcessUrl}${this.optionsToParams({ ...options, processDefinitionKey })}`, ApiBase.apiWeb);
  }

  getProcessInstance(processDefinitionKey: ProcessDefinitionKey, options?: FetchTaskOptions): Observable<Process> {
    return this.backendService
      .get(`${this.bpmProcessUrl}${this.optionsToParams({ ...options, processDefinitionKey })}`, ApiBase.apiWeb)
      .pipe(map(({ objects }) => objects[0]));
  }

  private optionsToParams(options: FetchTaskOptions): string {
    if (!options) return '';

    const params = [];
    Object.keys(options).forEach((o) => {
      params.push(`${o}=${options[o]}`);
    });
    return `?${params.join('&')}`;
  }

  createProcess(payload: ProcessCreatePayload): Observable<any> {
    return this.backendService.post(this.bpmProcessUrl, payload, ApiBase.apiWeb);
  }

  deleteProcess(url, processInstanceId: string): Observable<any> {
    return this.backendService.delete(`${url}/${processInstanceId}`, ApiBase.apiWeb);
  }

  getProcessHistory(processInstanceId: string): Observable<ProcessInstanceHistoryEntry[]> {
    return this.backendService.get(`/bpm/processes/${processInstanceId}/history`).pipe(
      map((res) =>
        res && res.tasks
          ? res.tasks
              .map((t) => ({
                id: t.id,
                name: this.system.getLocalizedResource(`${t.name}_label`) || t.name,
                description: t.description,
                assignee: t.assignee,
                createTime: new Date(t.createTime),
                claimTime: new Date(t.claimTime),
                endTime: new Date(t.endTime)
              }))
              .sort(Utils.sortValues('createTime'))
              .reverse()
          : []
      )
    );
  }
}
