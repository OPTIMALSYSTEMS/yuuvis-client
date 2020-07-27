import { ObjectType } from '@yuuvis/core';

/**
 * create a new state for the work with new created objects
 */
export interface CreateState {
  currentStep: CurrentStep;
  busy: boolean;
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
 * select an object type to create a new object
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
