import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Observable, ReplaySubject } from 'rxjs';
import { takeUntilDestroy } from 'take-until-destroy';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService implements OnDestroy {
  private currentState: ConnectionState = {
    isOnline: window.navigator.onLine
  };
  private connectionStateSource = new ReplaySubject<ConnectionState>();
  public connection$: Observable<ConnectionState> = this.connectionStateSource.asObservable();

  constructor() {
    this.connectionStateSource.next(this.currentState);
    fromEvent(window, 'online')
      .pipe(takeUntilDestroy(this))
      .subscribe(() => {
        this.currentState.isOnline = true;
        this.connectionStateSource.next(this.currentState);
      });

    fromEvent(window, 'offline')
      .pipe(takeUntilDestroy(this))
      .subscribe(() => {
        this.currentState.isOnline = false;
        this.connectionStateSource.next(this.currentState);
      });
  }

  ngOnDestroy() {}
}

export interface ConnectionState {
  isOnline: boolean;
}
