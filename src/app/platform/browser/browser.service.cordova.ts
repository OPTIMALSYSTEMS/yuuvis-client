import { Injectable } from '@angular/core';
import { IBrowserService } from './browser.interface';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Utils } from '@yuuvis/core';

@Injectable({
    providedIn: 'root'
})
export class BrowserServiceCordova implements IBrowserService {

    private browsers = new Map<string, any>();

    constructor(private iab: InAppBrowser) { }

    open(url: string): string {
        const browser = this.iab.create(url);
        const id = Utils.uuid();
        this.browsers.set(id, browser);
        return id;
    }

    addEventListener(id: string, event: string, callback: Function) {
        this.browsers.get(id).addEventListener(event, callback);
    }

    close(id: string) {
        const browser = this.browsers.get(id);
        if (browser) {
            browser.close();
        }
    }
}
