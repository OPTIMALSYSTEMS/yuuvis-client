import { Injectable } from '@angular/core';
import { fromEvent, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private currentState: ConnectionState = {
    isOnline: window.navigator.onLine
  };
  private connectionStateSource = new ReplaySubject<ConnectionState>();
  public connection$: Observable<ConnectionState> = this.connectionStateSource.asObservable();

  constructor() {
    this.connectionStateSource.next(this.currentState);
    fromEvent(window, 'online').subscribe(() => {
      this.currentState.isOnline = true;
      this.connectionStateSource.next(this.currentState);
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.currentState.isOnline = false;
      this.connectionStateSource.next(this.currentState);
    });
  }
}

export interface ConnectionState {
  isOnline: boolean;
}
