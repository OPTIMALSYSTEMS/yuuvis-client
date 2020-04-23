import { ValidatorFn, Validators } from '@angular/forms';
import { ObjectFormControl } from './object-form.model';
import { Situation } from './object-form.situation';
/**
 * @ignore
 * Custom validation class.
 */
export class FormValidation {
  /**
   * Build validators for the given form element to be attached to
   * a reactive formControl.
   *
   * @param formElement - form element object
   * @param situation - form situation to fetch validators for
   */
  static getValidators(formElement: any, situation: string): ValidatorFn[] {
    const elmValidators: ValidatorFn[] = [];
    const { required, regex } = formElement;

    // apply situation based validations
    switch (situation) {
      case Situation.SEARCH: {
        // TODO: implement general validators for SEARCH situation
        break;
      }
      default: {
        if (required) {
          elmValidators.push(Validators.required);
        }
        if (regex && !formElement.multiselect) {
          elmValidators.push(Validators.pattern(regex));
        }
        break;
      }
    }
    return elmValidators;
  }

  /**
   *
   * @param control - from object control
   * @returns Validation object {eoformScript: {valid: boolean}} or null
   */
  static customScriptingValidation(control: ObjectFormControl): Object | null {
    return control._eoFormElement && control._eoFormElement.error ? { eoformScript: { valid: false } } : null;
  }
}
