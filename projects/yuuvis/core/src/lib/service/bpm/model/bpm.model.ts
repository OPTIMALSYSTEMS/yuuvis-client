export enum ProcessDefinitionKey {
  FOLLOW_UP = 'follow-up',
  INVALID_TYPE = 'invalid_type'
}

/**
 * payload returned by bpmService /process
 */
export interface ProcessInstance {
  processDefinitionKey: ProcessDefinitionKey;
  name: string;
  businessKey: string;
  returnVariables?: boolean;
  // startFormVariables?: StartFormVariable[];
  variables?: StartFormVariable[];
}

/**
 * payload returned by bpmService /tasks
 */
// tslint:disable-next-line: no-empty-interface#
export interface InboxPayload extends ProcessInstance {}

interface Processes {
  id: string;
  url: string;
  name: string;
  processDefinitionId: string;
  processDefinitionUrl: string;
  suspended: boolean;
  variables: Variable[];
  tenantId: string;
}

/**
 * variables passt to the process
 */
export interface StartFormVariable {
  name: string;
  value: string;
}

/**
 * bpm Service response /process/instances
 */
export interface ProcessResponse {
  objects: ProcessData[];
  total: number;
  start: number;
  sort: string;
  order: string;
  size: number;
}

/**
 * bpm Service response /tasks
 */
export interface TaskDataResponse {
  objects: TaskData[];
  total: number;
  start: number;
  sort: string;
  order: string;
  size: number;
}

/**
 * process describing data
 */
export interface ProcessData extends Processes {
  businessKey: string;
  ended: boolean;
  processDefinitionName: string;
  processDefinitionDescription: string;
  activityId: null;
  startUserId: string;
  startTime: Date;
  callbackId: null;
  callbackType: null;
  referenceId: null;
  referenceType: null;
  completed: boolean;
  taskId?: string;
  icon?: string;
}
/**
 * task describing data
 */
export interface TaskData extends Processes {
  owner: null;
  assignee: string;
  delegationState: null;
  description: null;
  createTime: Date;
  dueDate: null;
  priority: number;
  claimTime: null;
  taskDefinitionKey: string;
  scopeDefinitionId: null;
  scopeId: null;
  scopeType: null;
  category: null;
  formKey: null;
  parentTaskId: null;
  parentTaskUrl: null;
  executionId: string;
  executionUrl: string;
  processInstanceId: string;
  processInstanceUrl: string;
  icon?: string;
}

/**
 * process varibales
 */
export interface Variable {
  name: string;
  type?: string;
  value: string | Date;
  scope?: string;
}

export enum TaskType {
  FOLLOW_UP = 'follow-up',
  TASK = 'task'
}

/**
 * Task wrapper for grid
 */
export class Task {
  get id() {
    return this.originalData.id;
  }

  get title(): string {
    return this.originalData.variables.find((v) => v.name === 'whatAbout')?.value as string;
  }

  get createTime(): Date {
    return new Date(this.originalData.createTime);
  }

  get description(): string {
    return this.originalData.variables.find((v) => v.name === 'whatAbout')?.value as string;
  }

  get task(): string {
    return this.originalData.name;
  }

  get documentId(): string {
    return this.originalData.variables.find((v) => v.name === 'documentId')?.value as string;
  }

  get type(): TaskType {
    return this.originalData.processDefinitionId.startsWith('follow-up') ? TaskType.FOLLOW_UP : TaskType.TASK;
  }

  get icon(): string {
    return this.originalData.icon;
  }

  get taskData() {
    return this.originalData;
  }

  constructor(private originalData: TaskData) {}
}

export enum ProcessStatus {
  RUNNING = 'running',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed'
}

/**
 * Process wrapper for grid
 */
export class Process {
  get id() {
    return this.originalData.id;
  }

  get title(): string {
    return this.originalData.variables.find((v) => v.name === 'whatAbout')?.value as string;
  }

  get expiryDateTime(): Date {
    return new Date(this.originalData.variables.find((v) => v.name === 'expiryDateTime')?.value);
  }

  get description(): string {
    return this.originalData.variables.find((v) => v.name === 'whatAbout')?.value as string;
  }

  get type(): string {
    return this.originalData.processDefinitionName;
  }

  get businessKey(): string {
    return this.originalData.businessKey;
  }

  get subject(): string {
    return this.originalData.name;
  }

  get whatAbout(): string {
    return this.originalData.variables.find((v) => v.name === 'whatAbout')?.value as string;
  }

  get documentId(): string {
    return this.originalData.variables.find((v) => v.name === 'documentId')?.value as string;
  }

  get startTime(): Date {
    return new Date(this.originalData.startTime);
  }

  get icon(): string {
    return this.originalData.icon;
  }

  get status(): ProcessStatus {
    let status: ProcessStatus;
    if (this.originalData.suspended) {
      status = ProcessStatus.SUSPENDED;
    } else if (this.originalData.completed) {
      status = ProcessStatus.COMPLETED;
    } else {
      status = ProcessStatus.RUNNING;
    }
    return status;
  }

  constructor(private originalData: ProcessData) {}
}
