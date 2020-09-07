import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SecondaryObjectTypeClassification, SystemService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { clear } from '../../svg.generated';
import { FormStatusChangedEvent, IObjectForm, ObjectFormOptions } from '../object-form.interface';
import { ObjectFormComponent } from '../object-form/object-form.component';

export interface CombinedObjectFormInput {
  formModels: { [key: string]: any };
  data: any;
  disabled?: boolean;
  /**
   * Enable controls for removing parts of the combined form that belong to
   * applied secondary object types that are not primary, required or static.
   */
  enableEditSOT?: boolean;
}

export interface CombinedFormAddInput {
  id: string;
  formModel: any;
  disabled: boolean;
  enableEditSOT: boolean;
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
    enableEditSOT: boolean;
    formOptions: ObjectFormOptions;
  }[];
  formStates: Map<string, FormStatusChangedEvent> = new Map<string, FormStatusChangedEvent>();
  formsChanged: boolean;

  @Input() set objectFormInput(ofi: CombinedObjectFormInput) {
    this.formsChanged = false;
    this.formStates.clear();
    this.forms =
      ofi && ofi.formModels
        ? Object.keys(ofi.formModels).map((k) => ({
            id: k,
            label: this.system.getLocalizedResource(`${k}_label`),
            enableEditSOT: ofi.enableEditSOT && this.canBeRemoved(k),
            formOptions: {
              formModel: ofi.formModels[k],
              data: ofi.data,
              disabled: ofi.disabled
            }
          }))
        : null;
  }

  /**
   * Emitted when the status of the combined form changes.
   */
  @Output() statusChanged = new EventEmitter<FormStatusChangedEvent>();
  /**
   * Emitted when one of the contained form should be removed. Only triggered
   * when `CombinedObjectFormInput` has `enableEditSOT` set to true.
   */
  @Output() sotRemove = new EventEmitter<any>();

  constructor(private system: SystemService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear]);
  }

  private canBeRemoved(id: string): boolean {
    const sot = this.system.getSecondaryObjectType(id);
    return sot
      ? !sot.classification ||
          (!sot.classification.includes(SecondaryObjectTypeClassification.PRIMARY) && !sot.classification.includes(SecondaryObjectTypeClassification.REQUIRED))
      : false;
  }

  onFormStatusChanged(formId: string, evt: FormStatusChangedEvent) {
    this.formStates.set(formId, evt);
    this.statusChanged.emit(this.getCombinedFormState());
  }

  private getCombinedFormState(): FormStatusChangedEvent {
    const combinedState: FormStatusChangedEvent = {
      dirty: !!this.formsChanged,
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
    return combinedState;
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
    this.objectForms.forEach((f) => {
      f.resetForm();
    });
  }

  /**
   * Add a new form to the combined forms
   * @param sotID Secondary object type ID
   * @param formModel SOTs form model
   * @param data data to be set upfront
   * @param disabled Whether ot not to disable all form controls
   */
  addForms(formModels: CombinedFormAddInput[], data: any) {
    if (!this.forms) {
      this.forms = [];
    }
    formModels.forEach((fm) => {
      this.forms.push({
        id: fm.id,
        label: this.system.getLocalizedResource(`${fm.id}_label`),
        enableEditSOT: fm.enableEditSOT,
        formOptions: {
          formModel: fm.formModel,
          data: data,
          disabled: fm.disabled
        }
      });
    });
    this.formsChanged = true;
    this.statusChanged.emit(this.getCombinedFormState());
  }

  /**
   * Remove a form from the combined forms
   * @param id ID of the form to be removed
   */
  removeForms(ids: string[]) {
    this.forms = this.forms.filter((f) => {
      const shouldBeRemoved = ids.includes(f.id);
      if (shouldBeRemoved) {
        this.formStates.delete(f.id);
      }
      return !shouldBeRemoved;
    });
    this.formsChanged = true;
    this.statusChanged.emit(this.getCombinedFormState());
  }

  ngOnInit(): void {}
}
