import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { Utils } from '@yuuvis/core';
import { IAuthFlowService } from './auth-flow.interface';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthFlowServiceCordova implements IAuthFlowService {

    private browser: InAppBrowserObject;

    constructor(private iab: InAppBrowser) { }

    openLoginUri(url: string, stopTrigger: Subject<void>) {
        this.browser = this.iab.create(url);
        this.browser.on('exit').subscribe(e => {
            stopTrigger.next();
            stopTrigger.complete();
        });
    }

    close() {
        if(this.browser) {
            this.browser.close();
        }
    }
}
