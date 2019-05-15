import { ResultComponent } from './result/result.component';
import { NgModule } from '@angular/core';
import { YuvObjectDetailsModule, YuvSearchModule, AngularSplitModule } from '@yuuvis/framework';
import { ResultStateRoutingModule } from './result/result.state.routes';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [ResultComponent],
    imports: [
      CommonModule,    
      ResultStateRoutingModule,
      YuvObjectDetailsModule,
      YuvSearchModule,
      AngularSplitModule
    ],
    providers: [],
  })
  export class ResultStateModule { }