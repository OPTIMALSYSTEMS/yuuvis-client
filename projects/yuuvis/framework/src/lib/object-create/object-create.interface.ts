import { ObjectType } from '@yuuvis/core';
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

export interface ObjectTypePreset {
  objectType: ObjectType;
  data: any;
}

/**
 * @ignore
 */
export enum CurrentStep {
  OBJECTTYPE = 'objecttype',
  FILES = 'files',
  INDEXDATA = 'indexdata',
  DLM_UPLOAD = 'dlm_upload',
  DLM_INDEXDATA = 'dlm_indexdata'
}
