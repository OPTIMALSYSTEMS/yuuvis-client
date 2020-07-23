import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PopoverConfig } from './popover.interface';

/**
 * Reference to a popover opened via the Popover service.
 */
export class PopoverRef<T = any> {
  private afterClosedSubject = new Subject<T>();

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
   * Emitted while closing the popover dialog
   * @param dialogResult
   */
  close(dialogResult?: T): void {
    this.afterClosedSubject.next(dialogResult);
    this.afterClosedSubject.complete();

    this.overlayRef.dispose();
  }
  /**
   * After closing a popover dialog creates a new Observable with a Subject as a source
   */
  afterClosed(): Observable<T> {
    return this.afterClosedSubject.asObservable();
  }
}
