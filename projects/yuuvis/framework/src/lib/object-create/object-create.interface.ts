import { ObjectType } from '@yuuvis/core';

/**
 * Providing the status of the new loaded object
 */
export interface CreateState {
  /**
   * shows the step of an uploading process
   */
  currentStep: CurrentStep;
  /**
   * Uploading process in a work
   */
  busy: boolean;
  /**
   * Uploading process was done
   */
  done: boolean;
}
/**
 * Interface for `ObjectCreateComponent` inside the object create panel
 */
export interface Breadcrumb {
  /**
   * shows the user at what step of creating a new object he is currently
   */
  step: string;
  /**
   * label of the breadcrumb menu
   */
  label: string;
  /**
   * visible or invisible breadcrumb menu at the moment
   */
  visible: boolean;
}
/**
 * Labels for `ObjectCreateComponent`
 */
export interface Labels {
  /**
   * object type titel
   */
  defaultTitle: string;
  /**
   * label to indicate that the object being created allows a file attachment
   */
  allowed: string;
  /**
   * label to indicate that the object being created not allow a file attachment
   */
  notallowed: string;
  /**
   * label to indicate that the object being created requires file attachment
   */
  required: string;
}

/**
 * @ignore
 */
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
  INDEXDATA = 'indexdata'
}
