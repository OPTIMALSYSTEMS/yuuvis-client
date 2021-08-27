export const ProcessAction = {
  complete: 'complete',
  save: 'save'
};

export const FollowUpVars = {
  expiryDateTime: 'expiryDateTime'
};

/**
 * In BPM you can create process models that define a couple of variables and
 * activities belonging to the process model.
 *
 * A process is an instance of such a process model. You will start a
 * process (process instance) from a process model.
 */
export interface Process {
  id: string;
  // objects (IDs) attached to the process
  attachments: string[];
  businessKey: string;
  deleteReason: string;
  durationInMillis: number;
  endActivityId: string;
  endTime: Date;
  initiator: ProcessUser;
  name: string;
  processDefinition: { description: string; id: string; name: string };
  startActivityId: string;
  startTime: Date;
  startUserId: string;
  subject: string;
  suspended: boolean;
  variables: ProcessVariable[];
}

/**
 * Tasks are basically activities defined by a process.
 * Processes may contain several tasks.
 */
export interface Task {
  id: string;
  // ID of the process instance that contains this task/activity
  processInstanceId: string;
  assignee: ProcessUser;
  claimTime: Date;
  createTime: Date;
  description: string;
  formKey: string;
  initiator: ProcessUser;
  name: string;
  owner: ProcessUser;
  parentTaskId: string;
  processDefinition: {
    id: string;
    name: string;
  };
  subject: string;
  suspended: false;
  variables: ProcessVariable[];
  attachments: string[];
}

export enum ProcessDefinitionKey {
  FOLLOW_UP = 'follow-up',
  INVALID_TYPE = 'invalid_type'
}
// payload for starting a new process
export interface ProcessCreatePayload extends ProcessPostPayload {
  processDefinitionKey: ProcessDefinitionKey;
  name?: string;
  businessKey?: string;
  returnVariables?: boolean;
}
// payload for post requests to the bpm backend
export interface ProcessPostPayload {
  variables?: ProcessVariable[];
  attachments?: string[];
  subject?: string;
}

export interface ProcessInstanceHistoryEntry {
  id: string;
  name: string;
  description: string;
  assignee: string;
  createTime: string;
  claimTime: string;
  endTime: string;
}

export interface ProcessUser {
  id: string;
  title: string;
}

/**
 * process varibales
 */
export interface ProcessVariable {
  name: string;
  type?: string;
  value: any;
  // TODO: Not yet supported by BPM-Engine
  readonly?: boolean;
  scope?: string;
}

export enum TaskType {
  FOLLOW_UP = 'follow-up',
  TASK = 'task'
}

export interface CreateFollowUp {
  expiryDateTime: Date;
  whatAbout: string;
}

export enum ProcessStatus {
  RUNNING = 'running',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed'
}

/**
 * Task wrapper for grid
 */
export class TaskRow {
  id: string;
  createTime: Date;
  subject: string;
  type: TaskType;
  task: Task;
  taskName: string;

  constructor(private originalData: Task) {
    this.id = originalData.id;
    this.subject = originalData.subject || originalData.processDefinition.name;
    this.createTime = new Date(this.originalData.createTime);
    this.task = originalData;
    this.taskName = this.task.name;
    this.type = this.originalData.processDefinition.id.startsWith('follow-up') ? TaskType.FOLLOW_UP : TaskType.TASK;
  }
}

export class ProcessRow {
  id: string;
  subject: string;
  expiryDateTime: Date;
  status: ProcessStatus;
  startTime: Date;

  constructor(protected data: Process) {
    this.id = data.id;
    this.subject = data.subject || data.processDefinition.name;
    this.startTime = data.startTime;
  }
}

// special type of ProcessRow
export class FollowUpRow extends ProcessRow {
  expiryDateTime: Date;

  constructor(protected data: Process) {
    super(data);
    const exDateVar = data.variables.find((v) => v.name === FollowUpVars.expiryDateTime);
    if (exDateVar) {
      this.expiryDateTime = new Date(exDateVar.value);
    }
  }
}
