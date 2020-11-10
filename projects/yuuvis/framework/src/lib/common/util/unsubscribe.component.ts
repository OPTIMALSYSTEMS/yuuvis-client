import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
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
