import { Injectable } from '@angular/core';
import { IBrowserService } from './browser.interface';
import { Utils } from '@yuuvis/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService implements IBrowserService {

  private browsers = new Map<string, any>();

  constructor() { }

  open(url: string): string {
    const win = window.open(url);
    const id = Utils.uuid();
    this.browsers.set(id, win);
    return id;
  }

  addEventListener(id: string, event: string, callback: Function) {
    this.browsers.get(id).addEventListener(event, callback);
  }

  close(id: string) {
    const win = this.browsers.get(id);
    if(win) {
      win.close();
    }
  }
}
