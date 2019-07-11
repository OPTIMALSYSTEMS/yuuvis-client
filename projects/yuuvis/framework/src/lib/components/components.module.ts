import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';
import { AngularSplitModule } from 'angular-split';
import { YuvPipesModule } from '../pipes/pipes.module';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { IndexdataEntryComponent } from './indexdata-entry/indexdata-entry.component';
import { ObjectDetailsHeaderComponent } from './object-details-header/object-details-header.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { ResponsiveMasterSlaveComponent } from './responsive-master-slave/responsive-master-slave.component';
import { YuvCommonUiModule } from '@yuuvis/common-ui';

@NgModule({
  declarations: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    IndexdataEntryComponent,
    ObjectDetailsHeaderComponent
  ],
  exports: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    IndexdataEntryComponent,
    ObjectDetailsHeaderComponent
  ],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    AngularSplitModule,
    AgGridModule.withComponents([]),
    RouterModule,
    YuvPipesModule,
    YuvCommonUiModule
  ]
})
export class YuvComponentsModule {}
