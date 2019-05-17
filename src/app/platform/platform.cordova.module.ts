import { NgModule } from '@angular/core';
import { AuthFlowServiceCordova } from './auth-flow/auth-flow.service.cordova';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AuthFlowService } from './auth-flow/auth-flow.service';

/**
 * Platform service implementations for cordova environment.
 */
@NgModule({
    providers: [{
        provide: AuthFlowService,
        useClass: AuthFlowServiceCordova
    },
        InAppBrowser
    ]
})
export class PlatformModuleCordova {
}
