import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DmsObject, DmsService, RetentionField, Utils } from '@yuuvis/core';

@Component({
  selector: 'yuv-retention-prolong',
  templateUrl: './retention-prolong.component.html',
  styleUrls: ['./retention-prolong.component.scss'],
  host: { class: 'yuv-action-component-form' }
})
export class RetentionProlongComponent implements OnInit {
  rtProlongForm: UntypedFormGroup;
  busy: boolean;
  private initialRetentionEnd: string;

  get rmExpirationDate() {
    return this.rtProlongForm.get('rmExpirationDate');
  }

  private _selection: DmsObject[];
  @Input() set selection(s: DmsObject[]) {
    this._selection = s;
    const v = s?.reduce((p, c) => p > c.data[RetentionField.RETENTION_END] ? p : c.data[RetentionField.RETENTION_END], null);
    this.initialRetentionEnd = Utils.transformDate(v);
    this.initialRetentionEnd && this.rtProlongForm.patchValue({
      rmExpirationDate: this.initialRetentionEnd
    });
  }
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dms: DmsService, private fb: UntypedFormBuilder) {
    this.rtProlongForm = this.fb.group({
      rmExpirationDate: ['', [Validators.required, this.afterInitialRetentionEndValidator()]]
    });
  }

  private afterInitialRetentionEndValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = this.initialRetentionEnd >= control.value;
      return forbidden ? { afterInitialRetentionEnd: { value: control.value } } : null;
    };
  }

  submit() {
    this.busy = true;
    const { rmExpirationDate } = this.rtProlongForm.value;

    const payload = [];
    this._selection.forEach((o) => {
      const data = {};
      // rmExpirationDate will have format like '2022-10-2' so we add time part as well to stay in our own timezone
      if (rmExpirationDate) data[RetentionField.RETENTION_END] = new Date(`${rmExpirationDate}T23:59:59.999`);
      // if there also is a destruction date we'll increase that by the same amount of days
      if (rmExpirationDate && o.data[RetentionField.DESTRUCTION_DATE]) {
        // calculate the difference between old and new retention end date
        const diff = data[RetentionField.RETENTION_END].getTime() - new Date(o.data[RetentionField.RETENTION_END]).getTime();
        data[RetentionField.DESTRUCTION_DATE] = new Date(new Date(o.data[RetentionField.DESTRUCTION_DATE]).getTime() + diff);
        console.debug(`Extending retention expiration date. Also increasing destruction date by ${diff / 1000 / 60 / 60 / 24} days.`);
      }
      payload.push({ id: o.id, data });
    });

    this.dms.updateDmsObjects(payload).subscribe({
      next: (res) => {
        this.busy = false;
        this.finished.emit();
      },
      error: (err) => {
        console.error(err);
        // this.notificationService.error(this.tra)
        this.busy = false;
      }
    });
  }

  cancel() {
    this.canceled.emit();
  }
  ngOnInit(): void {}
}
