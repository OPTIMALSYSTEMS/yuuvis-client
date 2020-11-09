import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Use for any custom cleanup that needs to occur when the instance is destroyed.
 */
// TODO: Add Angular decorator.
export abstract class UnsubscribeOnDestroy implements OnDestroy {
  protected componentDestroyed$: Subject<void>;
  /**
   * @ignore
   */
  constructor() {
    this.componentDestroyed$ = new Subject<void>();

    let f = this.ngOnDestroy;
    this.ngOnDestroy = () => {
      f.bind(this)();
      this.componentDestroyed$.next();
      this.componentDestroyed$.complete();
    };
  }

  ngOnDestroy() {
    // no-op
  }
}
