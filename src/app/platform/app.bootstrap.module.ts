import { NgModule } from '@angular/core';
import { AppComponent } from '../app.component';
import { AppModule } from '../app.module';
import { PlatformModuleCordova } from './platform.cordova.module';
import { PlatformModule } from './platform.module';

@NgModule({
  imports: [AppModule, PlatformModule],
  bootstrap: [AppComponent]
})
export class BootstrapModule {}

@NgModule({
  imports: [AppModule, PlatformModuleCordova],
  bootstrap: [AppComponent]
})
export class BootstrapModuleCordova {}
