export enum ProcessDefinitionKey {
  FOLLOW_UP = 'follow-up'
}

export interface ProcessInstance {
  processDefinitionKey: ProcessDefinitionKey;
  name: string;
  businessKey: string;
  returnVariables?: boolean;
  // startFormVariables?: StartFormVariable[];
  variables?: StartFormVariable[];
}

// tslint:disable-next-line: no-empty-interface
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

export interface StartFormVariable {
  name: string;
  value: string;
}

export interface ProcessResponse {
  data: ProcessData[];
  total: number;
  start: number;
  sort: string;
  order: string;
  size: number;
}

export interface TaskDataResponse {
  data: TaskData[];
  total: number;
  start: number;
  sort: string;
  order: string;
  size: number;
}

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
}

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
}

export interface Variable {
  name: string;
  type?: string;
  value: string | Date;
  scope?: string;
}

export class InboxItem {
  get id() {
    return this.originaData.id;
  }

  get title(): string {
    return this.originaData.variables.find((v) => v.name === 'whatAbout').value as string;
  }

  get expiryDateTime(): Date {
    return new Date(this.originaData.variables.find((v) => v.name === 'expiryDateTime').value);
  }

  get createTime(): Date {
    return new Date(this.originaData.createTime);
  }

  get description(): string {
    return this.title;
  }

  get subject(): string {
    return this.title;
  }

  get documentId(): string {
    return this.originaData.variables.find((v) => v.name === 'documentId').value as string;
  }

  get type(): string {
    return 'task';
  }

  constructor(private originaData: TaskData) {}
}

export class FollowUp {
  get id() {
    return this.originaData.id;
  }

  get title(): string {
    return this.originaData.variables.find((v) => v.name === 'whatAbout').value as string;
  }

  get expiryDateTime(): Date {
    return new Date(this.originaData.variables.find((v) => v.name === 'expiryDateTime').value);
  }

  get description(): string {
    return this.title;
  }

  get type(): string {
    return this.originaData.name;
  }

  get businessKey(): string {
    return this.originaData.businessKey;
  }

  get subject(): string {
    return this.title;
  }

  get documentId(): string {
    return this.originaData.variables.find((v) => v.name === 'documentId').value as string;
  }

  get startTime(): Date {
    return new Date(this.originaData.startTime);
  }

  constructor(private originaData: ProcessData) {}
}
