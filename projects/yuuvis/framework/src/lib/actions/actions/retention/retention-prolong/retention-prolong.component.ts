import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DmsObject, DmsService, RetentionField } from '@yuuvis/core';

@Component({
  selector: 'yuv-retention-prolong',
  templateUrl: './retention-prolong.component.html',
  styleUrls: ['./retention-prolong.component.scss'],
  host: { class: 'yuv-action-component-form' }
})
export class RetentionProlongComponent implements OnInit {
  rtProlongForm: FormGroup;
  busy: boolean;

  get rmExpirationDate() {
    return this.rtProlongForm.get('rmExpirationDate');
  }

  private _selection: DmsObject[];
  @Input() set selection(s: DmsObject[]) {
    this._selection = s;
    if (s?.length === 1) {
      const o = s[0];
      this.rtProlongForm.patchValue({
        rmExpirationDate: o.data[RetentionField.RETENTION_END]
      });
    }
  }
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dms: DmsService, private fb: FormBuilder) {
    this.rtProlongForm = this.fb.group({
      rmExpirationDate: ['', Validators.required]
    });
  }

  submit() {
    this.busy = true;
    const { rmExpirationDate } = this.rtProlongForm.value;

    const payload = [];
    this._selection.forEach((o) => {
      const data = {};
      data[RetentionField.RETENTION_END] = new Date(rmExpirationDate);
      // if there also is a destruction date we'll increase that by the same amount of days
      if (o.data[RetentionField.DESTRUCTION_DATE]) {
        // calculate the difference between old and new retention end date
        const diff = new Date(rmExpirationDate).getTime() - new Date(o.data[RetentionField.RETENTION_END]).getTime();
        const newDestructionDate = new Date(o.data[RetentionField.DESTRUCTION_DATE]).getTime() + diff;
        console.debug(`Also increasing destruction date by ${diff / 1000 / 60 / 60 / 24} days.`);
        data[RetentionField.DESTRUCTION_DATE] = new Date(newDestructionDate);
      }
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
