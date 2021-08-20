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

export interface ProcessInstanceHistoryEntry {
  id: string;
  name: string;
  description: string;
  assignee: string;
  // owner: null,
  createTime: string;
  claimTime: null;
  endTime: null;
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
  processDefinition: { id: string; name: string };
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
  subject: string;
  owner: ProcessUser;
  assignee: ProcessUser;
  // delegationState: null;
  description: string;
  createTime: Date;
  // dueDate: null;
  priority: number;
  // claimTime: null;
  taskDefinitionKey: string;
  // scopeDefinitionId: null;
  // scopeId: null;
  // scopeType: null;
  category: string;
  formKey: string;
  parentTaskId: string;
  parentTaskUrl: string;
  executionId: string;
  executionUrl: string;
  processInstanceId: string;
  processInstanceUrl: string;
  attachments: string[];
  icon?: string;
}

export interface ProcessUser {
  id: string;
  name: string;
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
  id: string;
  title: string;
  description: string;
  createTime: Date;
  task: string;
  attachments: string[];
  type: TaskType;
  icon: string;
  taskData: any;

  constructor(private originalData: TaskData) {
    this.id = originalData.id;
    this.title = originalData.subject;
    this.description = ''; // TODO: create meaningfull description from Task data
    this.createTime = new Date(this.originalData.createTime);
    this.task = originalData.name;
    this.attachments = this.originalData.attachments ? this.originalData.attachments : [];
    this.type = this.originalData.processDefinition.id.startsWith('follow-up') ? TaskType.FOLLOW_UP : TaskType.TASK;
    this.icon = originalData.icon;
    this.taskData = originalData;
  }
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
