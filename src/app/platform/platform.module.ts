import { NgModule } from '@angular/core';
import { BrowserService } from './browser/browser.service';

@NgModule({
    providers: [
        BrowserService
    ]
  })
  export class PlatformModule {
  }