import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';

@NgModule({
  declarations: [ResponsiveDataTableComponent],
  exports: [ResponsiveDataTableComponent],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    AgGridModule.withComponents([]),
  ]
})
export class YuvComponentsModule { }
