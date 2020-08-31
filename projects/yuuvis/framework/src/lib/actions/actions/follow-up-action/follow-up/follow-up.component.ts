import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProcessData, ProcessService, TranslateService } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit, ActionComponent {
  form: FormGroup;
  currentFollowUp: ProcessData;
  showdeleteMessage = false;
  folder = '';
  secondForm: FormGroup;

  @Input() selection: any[];
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() canceled: EventEmitter<any> = new EventEmitter();

  constructor(
    private processService: ProcessService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      expiryDateTime: [],
      whatAbout: '',
      documentId: null
    });

    this.form.controls['expiryDateTime'].setValidators(Validators.required);
  }

  createFollowUp() {
    this.processService.createFollowUp(this.selection[0].id, this.form.value).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.done.message')
      );
      this.finished.emit();
    });
  }

  editFollowUp() {
    this.processService.editFollowUp(this.selection[0].id, this.currentFollowUp.id, this.form.value).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.edit.done.message')
      );
      this.finished.emit();
    });
  }

  deleteFollowUp() {
    this.processService.deleteFollowUp(this.currentFollowUp.id).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.delete.message')
      );
      this.finished.emit();
    });
    this.showdeleteMessage = false;
  }

  cancel() {
    this.canceled.emit();
    this.showdeleteMessage = false;
  }

  ngOnInit() {
    this.processService.getFollowUp(this.selection[0].id).subscribe((res) => {
      this.currentFollowUp = res;
      let value: { expiryDateTime?: Date | string; whatAbout: string; documentId: string };
      if (this.currentFollowUp) {
        value = {
          expiryDateTime: this.currentFollowUp.variables.find((v) => v.name === 'expiryDateTime').value,
          whatAbout: this.currentFollowUp.variables.find((v) => v.name === 'whatAbout').value as string,
          documentId: this.selection[0].id
        };
      } else {
        const whatAbout = (this.selection[0].title ? `${this.selection[0].title}:` : '') as string;
        value = { whatAbout, documentId: this.selection[0].id };
      }
      this.form.patchValue(value);
      this.form.markAsPristine();
    });
  }
}
