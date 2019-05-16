import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PlatformModule } from './platform/platform.module';
import { PlatformModuleCordova } from './platform/platform.cordova.module';

@NgModule({
    imports: [
      AppModule,
      PlatformModule
    ],
    bootstrap: [AppComponent]
  })
  export class BootstrapModule {
  }

  @NgModule({
    imports: [
      AppModule,
      PlatformModuleCordova
    ],
    bootstrap: [AppComponent]
  })
  export class BootstrapModuleCordova {
  }