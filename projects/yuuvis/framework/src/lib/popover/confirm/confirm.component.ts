import { Component, Inject } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { ConfirmPopoverData } from '../popover.interface';
import { POPOVER_DATA } from '../popover.service';
import { ConfirmPopoverRef } from './confirm.ref';

@Component({
  selector: 'yuv-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  constructor(public popoverRef: ConfirmPopoverRef, @Inject(POPOVER_DATA) public data: ConfirmPopoverData, private translate: TranslateService) {
    if (!data.confirmLabel) data.confirmLabel = this.translate.instant('yuv.framework.shared.ok');
    if (!data.cancelLabel) data.cancelLabel = this.translate.instant('yuv.framework.shared.cancel');
  }

  confirm() {
    this.popoverRef.confirm();
  }

  cancel() {
    this.popoverRef.cancel();
  }
}
