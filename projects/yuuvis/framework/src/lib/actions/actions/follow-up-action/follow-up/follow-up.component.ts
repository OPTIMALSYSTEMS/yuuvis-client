import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BpmService } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit, ActionComponent {
  form: FormGroup;
  currentFollowUp: any;

  @Input() selection: any[];
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() canceled: EventEmitter<any> = new EventEmitter();

  constructor(private bpmService: BpmService, private fb: FormBuilder, private notificationService: NotificationService) {
    this.form = this.fb.group({
      expiryDateTime: [],
      whatAbout: ''
    });

    this.form.controls['expiryDateTime'].setValidators(Validators.required);
  }

  createFollowUp() {
    this.bpmService.createFollowUp(this.selection[0].id, this.form.value.expiryDateTime, this.form.value.whatAbout).subscribe(() => {
      this.finished.emit();
    });
  }

  editFollowUp() {
    this.bpmService
      .editFollowUp(this.selection[0].id, this.currentFollowUp.id, this.form.value.expiryDateTime, this.form.value.whatAbout)
      .subscribe(() => this.finished.emit());
  }

  deleteFollowUp() {
    this.bpmService.deleteFollowUp(this.currentFollowUp.id).subscribe(() => {
      this.finished.emit();
    });
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit(): void {
    this.bpmService.getFollowUp(this.selection[0].id).subscribe((res) => {
      this.currentFollowUp = res;
      if (this.currentFollowUp) {
        const value = {
          expiryDateTime: this.currentFollowUp.variables.find((v) => v.name === 'expiryDateTime').value,
          whatAbout: this.currentFollowUp.variables.find((v) => v.name === 'whatAbout').value
        };
        this.form.patchValue(value);
        this.form.markAsPristine();
      }
    });
  }
}
