import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SystemService } from '@yuuvis/core';
import { FormStatusChangedEvent, IObjectForm, ObjectFormOptions } from '../object-form.interface';
import { ObjectFormComponent } from '../object-form/object-form.component';

export interface CombinedObjectFormInput {
  formModels: { [key: string]: any };
  data: any;
}

@Component({
  selector: 'yuv-combined-object-form',
  templateUrl: './combined-object-form.component.html',
  styleUrls: ['./combined-object-form.component.scss']
})
export class CombinedObjectFormComponent implements OnInit, IObjectForm {
  @ViewChildren(ObjectFormComponent) objectForms: QueryList<ObjectFormComponent>;

  forms: {
    id: string;
    label: string;
    formOptions: ObjectFormOptions;
  }[];
  formStates: Map<string, FormStatusChangedEvent> = new Map<string, FormStatusChangedEvent>();

  @Input() set objectFormInput(ofi: CombinedObjectFormInput) {
    this.forms =
      ofi && ofi.formModels
        ? Object.keys(ofi.formModels).map((k) => ({
            id: k,
            label: this.system.getLocalizedResource(`${k}_label`),
            formOptions: {
              formModel: ofi.formModels[k],
              data: ofi.data
            }
          }))
        : null;
  }

  @Output() statusChanged = new EventEmitter<FormStatusChangedEvent>();

  constructor(private system: SystemService) {}

  onFormStatusChanged(formId: string, evt: FormStatusChangedEvent) {
    this.formStates.set(formId, evt);
    const combinedState: FormStatusChangedEvent = {
      dirty: false,
      indexdataChanged: false,
      invalid: false,
      data: {}
    };
    this.formStates.forEach((s) => {
      if (s.dirty) {
        combinedState.dirty = s.dirty;
      }
      if (s.indexdataChanged) {
        combinedState.indexdataChanged = s.indexdataChanged;
      }
      if (s.invalid) {
        combinedState.invalid = s.invalid;
      }
      combinedState.data = { ...combinedState.data, ...s.data };
    });
    this.statusChanged.emit(combinedState);
  }

  /**
   * Extracts the values from the form model. Each form value is represented by one
   * property on the result object holding the fields value. The keys (properties) are the `name`
   * properties of the form element (in SEARCH situation the `qname` field is used).
   *
   * How values are extracted is influenced by the forms situation.
   *
   * @return object of key value pairs
   */
  getFormData() {
    let data = {};
    this.objectForms.forEach((f) => {
      data = { ...data, ...f.getFormData() };
    });
    return data;
  }

  setFormPristine() {
    this.objectForms.forEach((f) => {
      f.setFormPristine();
    });
  }

  resetForm() {
    // this.initOptions();
    // this.emitFormChangedEvent();
  }

  ngOnInit(): void {}
}
