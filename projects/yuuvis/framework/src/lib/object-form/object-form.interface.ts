import { UntypedFormGroup } from '@angular/forms';
import { ObjectFormGroup } from './object-form.model';

export interface IObjectForm {
  getFormData(): void;
  setFormPristine(): void;
  resetForm(): void;
}

/**
 * @ignore
 */
export type ObjectFormModel = ObjectFormGroup | ObjectFormControlWrapper;
/**
 * Interface for providing components, that render an model based form.
 */
export interface ObjectFormOptions {
  /**
   * The form model holding all groups and elements
   */
  formModel: any;
  /**
   * Data to be merged with the forms model. Usually this will be an
   * object of property value pairs where the properties name equals the name of
   * the form element. For search forms (form situation 'SEARCH') data is supposed
   * to be an array of SearchFilter objects, because search forms may support
   * range searches in some cases.
   */
  data: any;
  // The id of the current DMS-Object
  objectId?: string;
  /**
   * whether or not to disable the complete form
   */
  disabled?: boolean;
  /**
   * in context of BPM forms, form scripts will also provide access to the actions
   * of a work item. This object is supposed to contain properties in a key value manner,
   * where key is the actions code and value is the WorkItemAction itself.
   */
  actions?: any;
  /**
   * object form may also provide a collection of objects to be passed to the
   * form script (e.g. BPM forms provide data from attached dms objects)
   */
  objects?: any[];

  context?: { id: string; title: string; objectTypeId: string };
}
/**
 * Wrapper for a rendering a from group
 */
export interface YuvFormGroupWrapper {
  /**
   * form control situation (CREATE, EDIT, SEARCH)
   */
  //
  situation: string;
  /**
   * the name of the wrapped form control
   */
  controlName: string;
}

/**
 * @ignore
 * Extend angulars default FormGroup for implementation of a form group wrapping
 * a form control.
 */
export class ObjectFormControlWrapper extends UntypedFormGroup {
  _eoFormControlWrapper: YuvFormGroupWrapper;
}

/**
 * Input data for a form group
 */
export interface YuvFormGroup {
  /**
   * the label for the form group
   */
  label?: string;
  /**
   * object holding properties defining layout properties of the group
   */
  //
  layout: any;
  /**
   * type of group indicating if the form is a stack, a fieldset or a simple group
   */
  type: string;
}

/**
 * event data emitted by the statusChanged callback
 */
export interface FormStatusChangedEvent {
  /**
   * flag indicating whether or not the form is invalid
   *
   */
  invalid: boolean;
  /**
   * flag indicating whether or not the form has been edited
   */
  dirty: boolean;
  /**
   * flag indicating whether or not the forms indexdata has been changed
   */
  indexdataChanged: boolean;
  /**
   * the extracted data from the form
   */

  data?: any;
}
