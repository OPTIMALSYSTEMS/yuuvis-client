import { ResultComponent } from './result/result.component';
import { NgModule } from '@angular/core';
import { YuvObjectDetailsModule, YuvSearchModule, AngularSplitModule } from '@yuuvis/framework';
import { ResultStateRoutingModule } from './result/result.state.routes';
import { CommonModule } from '@angular/common';
import { ResultDetailsComponent } from './result/result-details/result-details.component';
import { ResultStateService } from './result/result.state.service';

@NgModule({
    declarations: [ResultComponent, ResultDetailsComponent],
    imports: [
      CommonModule,    
      ResultStateRoutingModule,
      YuvObjectDetailsModule,
      YuvSearchModule,
      AngularSplitModule
    ],
    providers: [ResultStateService],
  })
  export class ResultStateModule { }