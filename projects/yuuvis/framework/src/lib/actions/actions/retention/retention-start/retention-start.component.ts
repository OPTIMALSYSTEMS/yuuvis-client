import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BaseObjectTypeField, DmsObject, DmsService, EventService, RetentionField, SystemSOT, Utils } from '@yuuvis/core';

@Component({
  selector: 'yuv-retention-start',
  templateUrl: './retention-start.component.html',
  styleUrls: ['./retention-start.component.scss'],
  host: { class: 'yuv-action-component-form' }
})
export class RetentionStartComponent {
  rtStartForm: UntypedFormGroup;
  busy: boolean;

  get rmExpirationDate() {
    return this.rtStartForm.get('rmExpirationDate');
  }
  get rmDestructionDate() {
    return this.rtStartForm.get('rmDestructionDate');
  }

  @Input() selection: DmsObject[];
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: UntypedFormBuilder, private dms: DmsService, private eventService: EventService) {
    this.rtStartForm = this.fb.group({
      rmExpirationDate: ['', Validators.required],
      rmDestructionDate: ['']
    });
    this.rtStartForm.setValidators(this.startFormValidator());
  }

  public startFormValidator(): ValidatorFn {
    return (group: UntypedFormGroup): ValidationErrors => {
      const rtStart = Utils.transformDate(new Date());
      const rtEnd = group.controls['rmExpirationDate'];
      const rtDestruct = group.controls['rmDestructionDate'];

      // start needs to be before end
      if (rtEnd.value && rtStart > rtEnd.value) {
        rtEnd.setErrors({ endBeforeStart: true });
      }
      // destruct date ...
      if (rtDestruct.value) {
        // ... requires retention perio to be set ...
        if (!rtEnd.value) {
          rtDestruct.setErrors({ retentionPeriodMissing: true });
        }
        // ... and needs to be after end date
        else if (rtDestruct.value < rtEnd.value) {
          rtDestruct.setErrors({ destructBeforeEnd: true });
        }
      }
      return;
    };
  }

  submit() {
    this.busy = true;
    const { rmExpirationDate, rmDestructionDate } = this.rtStartForm.value;

    const payload = [];
    this.selection.forEach((o) => {
      const data = {};
      data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...o.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS], SystemSOT.DESTRUCTION_RETENTION];
      data[RetentionField.RETENTION_START] = new Date();
      // rmExpirationDate will have format like '2022-10-2' so we add time part as well to stay in our own timezone
      if (rmExpirationDate) data[RetentionField.RETENTION_END] = new Date(`${rmExpirationDate}T23:59:59.999`);
      if (rmDestructionDate) data[RetentionField.DESTRUCTION_DATE] = new Date(`${rmDestructionDate}T23:59:59.999`);
      payload.push({ id: o.id, data });
    });

    this.dms.updateDmsObjects(payload).subscribe({
      next: (res) => {
        this.busy = false;
        this.finished.emit();
      },
      error: (err) => {
        console.error(err);
        this.busy = false;
      }
    });
  }

  cancel() {
    this.canceled.emit();
  }
}
