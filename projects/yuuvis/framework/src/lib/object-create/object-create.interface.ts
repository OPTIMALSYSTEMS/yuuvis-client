export interface CreateState {
  currentStep: CurrentStep;
  busy: boolean;
  done: boolean;
}

export interface Breadcrumb {
  step: string;
  label: string;
  visible: boolean;
}

export interface Labels {
  defaultTitle: string;
  allowed: string;
  notallowed: string;
  required: string;
}

export enum CurrentStep {
  OBJECTTYPE = 'objecttype',
  FILES = 'files',
  INDEXDATA = 'indexdata'
}
