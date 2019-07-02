import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';
import { AngularSplitModule } from 'angular-split';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { ResponsiveMasterSlaveComponent } from './responsive-master-slave/responsive-master-slave.component';

@NgModule({
  declarations: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent
  ],
  exports: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent
  ],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    AngularSplitModule,
    AgGridModule.withComponents([])
  ]
})
export class YuvComponentsModule {}
