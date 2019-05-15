import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectDetailsComponent } from './object-details/object-details.component';

@NgModule({
  declarations: [ObjectDetailsComponent],
  exports: [ObjectDetailsComponent],
  imports: [
    CommonModule
  ]
})
export class YuvObjectDetailsModule { }
