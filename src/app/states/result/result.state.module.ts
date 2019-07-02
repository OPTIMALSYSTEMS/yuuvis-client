import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  YuvComponentsModule,
  YuvObjectDetailsModule,
  YuvSearchModule
} from '@yuuvis/framework';
import { ResultDetailsComponent } from './result-details/result-details.component';
import { ResultComponent } from './result/result.component';
import { ResultStateRoutingModule } from './result/result.state.routes';

@NgModule({
  declarations: [ResultComponent, ResultDetailsComponent],
  imports: [
    CommonModule,
    ResultStateRoutingModule,
    YuvObjectDetailsModule,
    YuvComponentsModule,
    YuvSearchModule
  ]
})
export class ResultStateModule {}
