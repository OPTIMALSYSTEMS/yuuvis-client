import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';
import { AngularSplitModule } from 'angular-split';
import { TabViewModule } from 'primeng/tabview';
import { YuvPipesModule } from '../pipes/pipes.module';
import { ActionMenuBarComponent } from './action-menu-bar/action-menu-bar.component';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { ObjectDetailsHeaderComponent } from './object-details-header/object-details-header.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { ResponsiveMasterSlaveComponent } from './responsive-master-slave/responsive-master-slave.component';
import { ResponsiveTabContainerComponent } from './responsive-tab-container/responsive-tab-container.component';

@NgModule({
  declarations: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    ObjectDetailsHeaderComponent,
    ActionMenuBarComponent,
    ResponsiveTabContainerComponent
  ],
  exports: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    ObjectDetailsHeaderComponent,
    ActionMenuBarComponent,
    ResponsiveTabContainerComponent,
    TabViewModule
  ],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    AngularSplitModule,
    AgGridModule.withComponents([]),
    RouterModule,
    TabViewModule,
    YuvPipesModule,
    YuvCommonUiModule
  ]
})
export class YuvComponentsModule {}
