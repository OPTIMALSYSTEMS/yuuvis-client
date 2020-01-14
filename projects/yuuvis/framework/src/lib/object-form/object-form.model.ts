import { FormControl, FormGroup } from '@angular/forms';
import { YuvFormGroup } from './object-form.interface';

/**
 * @ignore
 * Extension of the default angular form group,
 */
export class ObjectFormGroup extends FormGroup {
  public _eoFormGroup: YuvFormGroup;
}
/**
 * @ignore
 * Extension of the default angular form control,
 */
export class ObjectFormControl extends FormControl {
  private __eoFormElement;

  public set _eoFormElement(v) {
    this.__eoFormElement = v;
  }

  public get _eoFormElement() {
    return this.__eoFormElement;
  }
}
