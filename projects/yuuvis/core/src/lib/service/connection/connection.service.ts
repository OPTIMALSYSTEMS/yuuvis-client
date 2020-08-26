import { Injectable } from '@angular/core';
import { fromEvent, Observable, ReplaySubject } from 'rxjs';

/**
 * This service is used for connecting and initializing in the client
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private currentState: ConnectionState = {
    isOnline: window.navigator.onLine
  };
  private connectionStateSource = new ReplaySubject<ConnectionState>();
  public connection$: Observable<ConnectionState> = this.connectionStateSource.asObservable();
  /**
   * @ignore
   */
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
/**
 * Check a connection state of a client
 */
export interface ConnectionState {
  /**
   * whether or not the application is online.
   */
  isOnline: boolean;
}
