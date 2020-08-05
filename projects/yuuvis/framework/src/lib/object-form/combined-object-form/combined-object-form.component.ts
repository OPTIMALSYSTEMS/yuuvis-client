import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SystemService } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../object-form.interface';

export interface CombinedObjectFormInput {
  formModels: { [key: string]: any };
  data: any;
}

@Component({
  selector: 'yuv-combined-object-form',
  templateUrl: './combined-object-form.component.html',
  styleUrls: ['./combined-object-form.component.scss']
})
export class CombinedObjectFormComponent implements OnInit {
  forms: {
    id: string;
    label: string;
    formOptions: ObjectFormOptions;
  }[];
  formStates: Map<string, FormStatusChangedEvent> = new Map<string, FormStatusChangedEvent>();

  @Input() set objectFormInput(ofi: CombinedObjectFormInput) {
    this.forms = ofi
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

  ngOnInit(): void {}
}
