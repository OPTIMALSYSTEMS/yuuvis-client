import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SecondaryObjectTypeClassification, SystemService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { clear } from '../../svg.generated';
import { FormStatusChangedEvent, IObjectForm, ObjectFormOptions } from '../object-form.interface';
import { ObjectFormComponent } from '../object-form/object-form.component';

export interface CombinedObjectFormInput {
  // main form
  main: any;
  // forms for extendables
  extensions?: { [key: string]: any };
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

  mainFormOptions: ObjectFormOptions;
  extensionForms: {
    id: string;
    label: string;
    enableEditSOT: boolean;
    formOptions: ObjectFormOptions;
  }[];
  private formStates: Map<string, FormStatusChangedEvent> = new Map<string, FormStatusChangedEvent>();
  formsChanged: boolean;
  combinedFormState: FormStatusChangedEvent;

  @Input() set objectFormInput(ofi: CombinedObjectFormInput) {
    this.formsChanged = false;
    this.formStates.clear();

    if (ofi.main?.elements.length) {
      this.mainFormOptions = {
        formModel: ofi.main,
        data: ofi.data,
        disabled: ofi.disabled
      };
    } else {
      // could have been reset
      this.mainFormOptions = null;
    }

    this.extensionForms =
      ofi && ofi.extensions
        ? Object.keys(ofi.extensions).map((k) => ({
            id: k,
            label: this.system.getLocalizedResource(`${k}_label`),
            enableEditSOT: ofi.enableEditSOT && this.canBeRemoved(k),
            formOptions: {
              formModel: ofi.extensions[k],
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
    return sot ? !sot.classification || !sot.classification.includes(SecondaryObjectTypeClassification.EXTENSION_REMOVE_FALSE) : false;
  }

  onFormStatusChanged(formId: string, evt: FormStatusChangedEvent) {
    this.formStates.set(formId, evt);
    this.statusChanged.emit(this.getCombinedFormState());
  }

  private getCombinedFormState(): FormStatusChangedEvent {
    this.combinedFormState = {
      dirty: this.formsChanged && (!!this.mainFormOptions || (this.extensionForms && this.extensionForms.length > 0)),
      indexdataChanged: false,
      invalid: false,
      data: {}
    };
    this.formStates.forEach((s) => {
      if (s.dirty) {
        this.combinedFormState.dirty = s.dirty;
      }
      if (s.indexdataChanged) {
        this.combinedFormState.indexdataChanged = s.indexdataChanged;
      }
      if (s.invalid) {
        this.combinedFormState.invalid = s.invalid;
      }
      this.combinedFormState.data = { ...this.combinedFormState.data, ...s.data };
    });
    return this.combinedFormState;
  }

  /**
   * Extracts the values from the form model. Each form value is represented by one
   * property on the result object holding the fields value. The keys (properties) are the `name`
   * properties of the form element.
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
    this.formStates.clear();
    this.formsChanged = false;
  }

  /**
   * Add a new form to the combined forms
   * @param sotID Secondary object type ID
   * @param formModel SOTs form model
   * @param data data to be set upfront
   * @param disabled Whether ot not to disable all form controls
   */
  addForms(formModels: CombinedFormAddInput[], data: any) {
    if (!this.extensionForms) {
      this.extensionForms = [];
    }
    formModels.forEach((fm) => {
      this.extensionForms.push({
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
    this.extensionForms = this.extensionForms.filter((f) => {
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
