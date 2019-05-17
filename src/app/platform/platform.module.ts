import { NgModule } from '@angular/core';
import { AuthFlowService } from './auth-flow/auth-flow.service';

@NgModule({
    providers: [
        AuthFlowService
    ]
  })
  export class PlatformModule {
  }