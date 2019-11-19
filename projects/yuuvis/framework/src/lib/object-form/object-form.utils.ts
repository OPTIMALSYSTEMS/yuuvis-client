import { ContentStreamField } from '@yuuvis/core';
import { ObjectFormControlWrapper } from './object-form.interface';
import { ObjectFormControl } from './object-form.model';
import { FormValidation } from './object-form.validation';

export class ObjectFormUtils {
  /**
   * Converts a form element object to an ObjectFormControlWrapper which then can be used to
   * render a from control. Result can be used as input for FormElementComponent.
   *
   * @param element - the element object or a json string
   * @param situation - optional property to set up a form situation for the control (default is EDIT)
   * @return the converted ObjectFormControlWrapper or null in case of an error
   */
  static elementToFormControl(formElement: any, situation?: string): ObjectFormControlWrapper {
    // Create the ObjectFormControlWrapper
    let wrapper = new ObjectFormControlWrapper({});
    let formSituation = situation ? situation : 'EDIT';

    wrapper._eoFormControlWrapper = {
      controlName: formElement.name,
      situation: formSituation
    };

    // create the actual form control
    let controlDisabled = !!formElement.readonly;
    let formControl = new ObjectFormControl(
      {
        value: formElement.value,
        disabled: controlDisabled
      },
      FormValidation.getValidators(formElement, formSituation)
    );

    // Form elements in SEARCH situation may arrive with a value set to NULL (explicit search for
    // fields that are NOT set). In that case we need to prepare the form control
    if (formSituation === 'SEARCH' && formElement.value === null) {
      formElement.isNotSetValue = true;
    }

    ObjectFormUtils.updateFormElement(formElement);

    formControl._eoFormElement = formElement;
    wrapper.addControl(formElement.name, formControl);

    return wrapper;
  }

  static updateFormElement(formElement: any) {
    if (formElement.type === 'decimal' && !formElement.scale) {
      formElement.scale = 2;
    }

    if (formElement.type === 'integer' && formElement.id === ContentStreamField.LENGTH) {
      formElement.classification = 'filesize';
    }
    return formElement;
  }
}
