import { AfterViewInit, Component, ElementRef, HostListener, Inject } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { ConfirmPopoverData } from '../popover.interface';
import { POPOVER_DATA } from '../popover.service';
import { ConfirmPopoverRef } from './confirm.ref';

@Component({
  selector: 'yuv-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements AfterViewInit {
  @HostListener('keydown.escape')
  escapeHandler() {
    this.cancel();
  }

  constructor(
    public popoverRef: ConfirmPopoverRef,
    @Inject(POPOVER_DATA) public data: ConfirmPopoverData,
    private elRef: ElementRef,
    private translate: TranslateService
  ) {
    if (!data.confirmLabel) data.confirmLabel = this.translate.instant('yuv.framework.shared.ok');
    if (!data.cancelLabel) data.cancelLabel = this.translate.instant('yuv.framework.shared.cancel');
  }

  confirm() {
    this.popoverRef.confirm();
  }

  cancel() {
    this.popoverRef.cancel();
  }
  ngAfterViewInit(): void {
    const confirmButtonEl = this.elRef.nativeElement.querySelector('button.primary');
    if (confirmButtonEl) confirmButtonEl.focus();
  }
}
