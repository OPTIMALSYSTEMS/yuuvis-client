import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { ActionModule } from '../actions';
import { YuvComponentsModule } from '../components';
import { YuvPipesModule } from '../pipes/pipes.module';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { IndexdataEntryComponent } from './summary/indexdata-entry/indexdata-entry.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  imports: [CommonModule, YuvComponentsModule, YuvPipesModule, ActionModule,
    YuvCommonUiModule],
  declarations: [
    ObjectDetailsComponent,
    SummaryComponent,
    IndexdataEntryComponent
  ],
  exports: [ObjectDetailsComponent, SummaryComponent]
})
export class YuvObjectDetailsModule { }
