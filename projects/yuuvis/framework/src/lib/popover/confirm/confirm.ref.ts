import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

// remote control for confirm overlays
export class ConfirmPopoverRef {
  private result = new Subject<boolean>();
  result$: Observable<boolean> = this.result.asObservable();

  constructor(private overlayRef: OverlayRef) {}

  confirm() {
    this.result.next(true);
    this.close();
  }

  cancel() {
    this.result.next(false);
    this.close();
  }

  close(): void {
    this.overlayRef.dispose();
  }
}
