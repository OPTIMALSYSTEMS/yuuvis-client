import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';

@NgModule({
  declarations: [ResponsiveDataTableComponent, BusyOverlayDirective],
  exports: [ResponsiveDataTableComponent, BusyOverlayDirective],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    AgGridModule.withComponents([])
  ]
})
export class YuvComponentsModule {}
