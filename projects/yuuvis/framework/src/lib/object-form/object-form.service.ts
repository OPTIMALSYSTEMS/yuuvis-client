import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Logger, SystemService, YuvUser } from '@yuuvis/core';
import { ReferenceEntry } from '../form/elements/reference/reference.interface';
import { ObjectFormControlWrapper, ObjectFormModel } from './object-form.interface';
import { ObjectFormGroup } from './object-form.model';
import { Situation } from './object-form.situation';
import { ObjectFormUtils } from './object-form.utils';

/**
 * @ignore
 */
@Injectable()
export class ObjectFormService {
  private datePipe = new DatePipe('en');

  constructor(private logger: Logger, private systemService: SystemService) {}

  /**
   * Converts a form element object to an ObjectFormControlWrapper which then can be used to
   * render a from control. Result can be used as input for FormElementComponent.
   *
   * @param element - the element object or a json string
   * @param situation - optional property to set up a form situation for the control (default is EDIT)
   * @return the converted ObjectFormControlWrapper or null in case of an error
   */
  elementToFormControl(element: any, situation?: string): ObjectFormControlWrapper {
    let formElement;
    if (typeof element === 'string') {
      try {
        formElement = JSON.parse(element);
      } catch (e) {
        this.logger.error('Unable to parse form element from json ', formElement);
      }
    } else {
      formElement = element;
    }
    return !!formElement ? ObjectFormUtils.elementToFormControl(element, situation) : null;
  }

  /**
   * Extract data from an object form based on situation.
   *
   * @param form - form to extract data from
   * @param situation - form situation
   * @param [initialData] - optional form data to match the current values against
   * This is required for editig indexdata (EDIT situation), because we have to compare new values
   * against the initial values. If a property that is contained in the forms initial data is removed
   * (e.g. set to null) then we have to set this null value, because otherwise the server would
   * ignore the changes.
   * @param isTableRowEditForm Flag indicating that the provided form is an inline form used by
   * a forms table element for editing rows. Those need a special handling.
   * @return extracted data as object
   */
  extractFormData(form: ObjectFormGroup, situation: string, initialData?: any, isTableRowEditForm?: boolean) {
    let extractedData = {};
    this.getElementValues(extractedData, form, situation || 'EDIT', initialData, isTableRowEditForm);
    return extractedData;
  }

  // Recursive method to get the values from each form control.
  private getElementValues(data: any, formControl: ObjectFormModel, situation: string, initialData?: any, isTableRowEditForm?: boolean) {
    if (!formControl || !formControl.controls) {
      return;
    }

    if (formControl instanceof ObjectFormControlWrapper) {
      const fc: any = formControl.controls[formControl._eoFormControlWrapper.controlName];

      if (fc._eoFormElement.isNotSetValue === true) {
        // form elements may explicitly set to have NULL value (e.g. from Search form if values are requested that have no values)
        this.setDataValue(fc._eoFormElement.name, null, data, fc._eoFormElement, isTableRowEditForm);
      } else if (fc.value !== undefined) {
        let val = fc.value;

        switch (situation) {
          case Situation.SEARCH: {
            if (val !== null) {
              this.setDataValue(fc._eoFormElement.name, val, data, fc._eoFormElement, isTableRowEditForm);
            }
            break;
          }
          case Situation.CREATE: {
            if (val !== null) {
              this.setDataValue(fc._eoFormElement.name, val, data, fc._eoFormElement, isTableRowEditForm);
            }
            break;
          }
          case Situation.EDIT: {
            // in edit situation we have to compare new values against the initial values
            // If a property that is contained in the forms initial data is removed (e.g. set to null)
            // then we have to set this null value, because otherwise the server will ignore the changes
            if (val !== null || (initialData && initialData[fc._eoFormElement.name] !== undefined)) {
              // data[fc._eoFormElement.name] = val;
              this.setDataValue(fc._eoFormElement.name, val, data, fc._eoFormElement, isTableRowEditForm);
            }
            break;
          }
        }
      } else if (fc._eoFormElement.type === 'boolean') {
        // tri-state boolean fields could have a value of 'undefined' that needs to be transformed
        // into 'null' to be correctly be processed by the backend
        this.setDataValue(fc._eoFormElement.name, null, data, fc._eoFormElement, isTableRowEditForm);
      }
    } else {
      Object.keys(formControl.controls).forEach((controlKey) => {
        let formControlKeyed = <ObjectFormGroup>formControl.controls[controlKey];
        this.getElementValues(data, formControlKeyed, situation, initialData, isTableRowEditForm);
      });
    }
  }

  private setDataValue(key, value, data, formElement, isTableRowEditForm) {
    data[key] = value;

    if (isTableRowEditForm && formElement.dataMeta) {
      if (formElement._internalType === 'string:organization') {
        data[key + '_title'] = formElement.dataMeta.map((d: YuvUser) => d.title);
      } else if (formElement._internalType === 'string:reference') {
        data[key + '_title'] = formElement.dataMeta.map((e: ReferenceEntry) => e.title);
      }
    }
  }
}
