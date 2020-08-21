export enum ProcessDefinitionKey {
  FOLLOW_UP = 'follow-up'
}

export interface ProcessInstance {
  processDefinitionKey: ProcessDefinitionKey;
  name: string;
  businessKey: string;
  returnVariables: boolean;
  startFormVariables: StartFormVariable[];
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

export interface ProcessDataResponse {
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
