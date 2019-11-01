import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';
import { AngularSplitModule } from 'angular-split';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { YuvPipesModule } from '../pipes/pipes.module';
import { ActionMenuBarComponent } from './action-menu-bar/action-menu-bar.component';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { DialogComponent } from './dialog/dialog.component';
import { FilePickerComponent } from './file-picker/file-picker.component';
import { PanelComponent } from './panel/panel.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { ResponsiveMasterSlaveComponent } from './responsive-master-slave/responsive-master-slave.component';
import { ResponsiveTabContainerComponent } from './responsive-tab-container/responsive-tab-container.component';
import { StepperPanelComponent } from './stepper-panel/stepper-panel.component';
import { UploadProgressOverlayComponent } from './upload-progress-overlay/upload-progress-overlay.component';

@NgModule({
  declarations: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    ActionMenuBarComponent,
    ResponsiveTabContainerComponent,
    PanelComponent,
    DialogComponent,
    StepperPanelComponent,
    UploadProgressOverlayComponent,
    FilePickerComponent
  ],
  exports: [
    ResponsiveDataTableComponent,
    BusyOverlayDirective,
    ResponsiveMasterSlaveComponent,
    ActionMenuBarComponent,
    ResponsiveTabContainerComponent,
    TabViewModule,
    PanelComponent,
    ActionMenuBarComponent,
    DialogComponent,
    FilePickerComponent,
    StepperPanelComponent,
    UploadProgressOverlayComponent
  ],
  imports: [
    CommonModule,
    AngularResizedEventModule,
    CdkStepperModule,
    AngularSplitModule,
    AgGridModule.withComponents([]),
    RouterModule,
    TabViewModule,
    DialogModule,
    ProgressBarModule,
    YuvPipesModule,
    YuvCommonUiModule,
    TranslateModule
  ]
})
export class YuvComponentsModule {}
