import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PopoverConfig } from './popover.interface';

/**
 * Reference to a popover opened via the Popover service.
 */
export class PopoverRef<T = any> {
  private afterClosedSubject = new Subject<T>();
  public preventClose: () => boolean = () => {
    return false;
  };

  /**
   * @ignore
   * @param overlayRef
   * @param config
   */
  constructor(private overlayRef: OverlayRef, public config: PopoverConfig) {
    if (!config.disableClose) {
      this.overlayRef.backdropClick().subscribe(() => {
        this.close();
      });

      this.overlayRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
        .subscribe(() => {
          this.close();
        });
    }
  }

  /**
   * Performed during closing the popover dialog
   * @param dialogResult
   */
  close(dialogResult?: T): void {
    if (!this.preventClose()) {
      this.afterClosedSubject.next(dialogResult);
      this.afterClosedSubject.complete();
      this.overlayRef.dispose();
    }
  }
  /**
   * After closing a popover dialog will be clean a cash and return new values
   */
  afterClosed(): Observable<T> {
    return this.afterClosedSubject.asObservable();
  }
}
