import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BaseObjectTypeField, DmsObject, DmsService, RetentionField, SystemSOT } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';

@Component({
  selector: 'yuv-retention-start',
  templateUrl: './retention-start.component.html',
  styleUrls: ['./retention-start.component.scss'],
  host: { class: 'yuv-action-component-form' }
})
export class RetentionStartComponent implements OnInit {
  rtStartForm: FormGroup;
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

  constructor(private fb: FormBuilder, private notificationService: NotificationService, private dms: DmsService) {
    this.rtStartForm = this.fb.group({
      rmExpirationDate: ['', Validators.required],
      rmDestructionDate: ['']
    });
    this.rtStartForm.setValidators(this.startFormValidator());
  }

  public startFormValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const rtStart = new Date();
      const rtEnd = group.controls['rmExpirationDate'];
      const rtDestruct = group.controls['rmDestructionDate'];

      // start needs to be before end
      if (rtEnd && rtStart <= rtEnd.value) {
        group.setErrors({ endBeforeStart: true });
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
      data[RetentionField.RETENTION_START] = new Date().toISOString();
      data[RetentionField.RETENTION_END] = new Date(rmExpirationDate).toISOString();
      if (rmDestructionDate) data[RetentionField.DESTRUCTION_DATE] = rmDestructionDate;
      payload.push({ id: o.id, data });
    });

    this.dms.updateDmsObjects(payload).subscribe(
      (res) => {
        this.busy = false;
        this.finished.emit();
      },
      (err) => {
        console.error(err);
        // this.notificationService.error(this.tra)
        this.busy = false;
      }
    );
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit(): void {}
}
