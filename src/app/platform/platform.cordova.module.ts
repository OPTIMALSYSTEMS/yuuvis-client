import { NgModule } from '@angular/core';
import { BrowserServiceCordova } from './browser/browser.service.cordova';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { BrowserService } from './browser/browser.service';

/**
 * Platform service implementations for cordova environment.
 */
@NgModule({
    providers: [{
        provide: BrowserService,
        useClass: BrowserServiceCordova
    },
        InAppBrowser
    ]
})
export class PlatformModuleCordova {
}
