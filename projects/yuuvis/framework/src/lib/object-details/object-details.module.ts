import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvComponentsModule } from '../components';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  imports: [CommonModule, YuvComponentsModule],
  declarations: [ObjectDetailsComponent, SummaryComponent],
  exports: [ObjectDetailsComponent, SummaryComponent]
})
export class YuvObjectDetailsModule {}
