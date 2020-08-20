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

export interface ProcessData {
  id: string;
  url: string;
  name: string;
  businessKey: string;
  suspended: boolean;
  ended: boolean;
  processDefinitionId: string;
  processDefinitionUrl: string;
  processDefinitionName: string;
  processDefinitionDescription: string;
  activityId: null;
  startUserId: string;
  startTime: Date;
  variables: Variable[];
  callbackId: null;
  callbackType: null;
  referenceId: null;
  referenceType: null;
  tenantId: string;
  completed: boolean;
}

export interface Variable {
  name: string;
  type?: string;
  value: string;
  scope?: string;
}
