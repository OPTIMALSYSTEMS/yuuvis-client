import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Logger, RangeValue, SystemService } from '@yuuvis/core';
import { ObjectFormControlWrapper, ObjectFormModel } from './object-form.interface';
import { ObjectFormControl, ObjectFormGroup } from './object-form.model';
import { FormValidation } from './object-form.validation';

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

    if (!formElement) {
      return null;
    }

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

    formControl._eoFormElement = formElement;
    wrapper.addControl(formElement.name, formControl);

    return wrapper;
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
        this.setDataValue(fc._eoFormElement.qname, null, data, fc._eoFormElement, isTableRowEditForm);
      } else if (fc.value !== undefined) {
        let val = fc.value;

        // // make sure that meta data are also up to date
        // if (fc._eoFormElement.type === 'CODESYSTEM') {
        //   const cs = this.systemService.getCodesystem(fc._eoFormElement.codesystem.id);
        //   fc._eoFormElement.dataMeta = cs.entries.find(e => e.data === val);
        // }

        switch (situation) {
          case 'SEARCH': {
            if (val !== null) {
              // row editing forms use the name instead of the qname because otherwise the
              // tables grid isn't able to map the fields
              if (!isTableRowEditForm) {
                this.setDataValue(fc._eoFormElement.qname, val, data, fc._eoFormElement, isTableRowEditForm);
              } else {
                this.setDataValue(fc._eoFormElement.name, val, data, fc._eoFormElement, isTableRowEditForm);
              }
            }
            break;
          }
          case 'CREATE': {
            if (val !== null) {
              this.setDataValue(fc._eoFormElement.name, val, data, fc._eoFormElement, isTableRowEditForm);
            }
            break;
          }
          case 'EDIT': {
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
      }
    } else {
      Object.keys(formControl.controls).forEach(controlKey => {
        let formControlKeyed = <ObjectFormGroup>formControl.controls[controlKey];
        this.getElementValues(data, formControlKeyed, situation, initialData, isTableRowEditForm);
      });
    }
  }

  private setDataValue(key, value, data, formElement, isTableRowEditForm) {
    data[key] = this.formatValue(value, formElement);

    if (isTableRowEditForm && formElement.dataMeta) {
      // inner tables need to set up the meta data as well
      data[key + '_meta'] = formElement.dataMeta;
    }
  }

  formatValue(value, formElement) {
    if (formElement.type === 'DATE') {
      if (typeof value === 'string' || value instanceof Date) {
        return this.datePipe.transform(value, 'yyyy-MM-dd');
      } else if (value instanceof RangeValue) {
        return new RangeValue(
          value.operator,
          value.firstValue && this.datePipe.transform(value.firstValue, 'yyyy-MM-dd'),
          value.secondValue && this.datePipe.transform(value.secondValue, 'yyyy-MM-dd')
        );
      }
    }

    // if (formElement.type === 'TABLE') {
    //   (formElement.elements || []).forEach(el => {
    //     (value || []).forEach(v => v[el.name] = this.formatValue(v[el.name], el));
    //   });
    // }
    return value;
  }
}
