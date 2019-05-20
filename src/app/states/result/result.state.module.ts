import { ResultComponent } from './result/result.component';
import { NgModule } from '@angular/core';
import { YuvObjectDetailsModule, YuvSearchModule, AngularSplitModule } from '@yuuvis/framework';
import { CommonModule } from '@angular/common';
import { ResultStateRoutingModule } from './result/result.state.routes';

@NgModule({
    declarations: [ResultComponent],
    imports: [
      CommonModule,    
      ResultStateRoutingModule,
      YuvObjectDetailsModule,
      YuvSearchModule,
      AngularSplitModule
    ]
  })
  export class ResultStateModule { }