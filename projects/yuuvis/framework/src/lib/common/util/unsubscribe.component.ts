import {Subject} from 'rxjs';
import {OnDestroy} from '@angular/core';

export abstract class UnsubscribeOnDestroy implements OnDestroy {

  protected componentDestroyed$: Subject<void>;

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
