import { Injectable, NgZone } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { IAuthFlowService } from './auth-flow.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthFlowService implements IAuthFlowService {

  private win;

  constructor(private ngZone: NgZone) { }

  openLoginUri(url: string, stopTrigger: Subject<void>) {

    this.win = window.open(url, 'auth');
    if (this.win) {
      // @see: http://atashbahar.com/post/2010-04-27-detect-when-a-javascript-popup-window-gets-closed
      this.ngZone.runOutsideAngular(() => {
        const winTimer = setInterval(() => {
          if (this.win.closed) {
            clearInterval(winTimer);
            this.ngZone.run(() => {
              stopTrigger.next();
              stopTrigger.complete();
            });
          }
        }, 1000);
      });
    }
  }

  close() {
    if(this.win) {
      this.win.close();
    }
  }
}
