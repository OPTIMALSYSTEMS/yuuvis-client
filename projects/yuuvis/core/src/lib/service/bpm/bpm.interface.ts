export interface ProcessInstance {
  processDefinitionKey: string;
  name: string;
  businessKey: string;
  returnVariables: boolean;
  startFormVariables: StartFormVariable[];
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
  type: string;
  value: string;
  scope: string;
}
