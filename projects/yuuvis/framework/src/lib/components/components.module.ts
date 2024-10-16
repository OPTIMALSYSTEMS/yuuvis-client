import { AgGridModule } from '@ag-grid-community/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { YuvCommonModule } from '../common/common.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvComponentRegister } from './../shared/utils/utils';
import { ActionMenuBarComponent } from './action-menu-bar/action-menu-bar.component';
import { ActionMenuButtonComponent } from './action-menu-bar/action-menu-button/action-menu-button.component';
import { IconUploadComponent } from './animated-icons/icon-upload/icon-upload.component';
import { BusyOverlayDirective } from './busy-overlay/busy-overlay.directive';
import { DmsObjectTileComponent } from './dms-object-tile/dms-object-tile.component';
import { FilePickerComponent } from './file-picker/file-picker.component';
import { PanelComponent } from './panel/panel.component';
import { RecentActivitiesComponent } from './recent-activities/recent-activities.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { ResponsiveMasterSlaveComponent } from './responsive-master-slave/responsive-master-slave.component';
import { ResponsiveTabContainerComponent } from './responsive-tab-container/responsive-tab-container.component';
import { TabPanelComponent } from './responsive-tab-container/tab-panel.component';
import { UploadProgressOverlayComponent } from './upload-progress-overlay/upload-progress-overlay.component';

const components = [
  TabPanelComponent,
  PanelComponent,
  FilePickerComponent,
  UploadProgressOverlayComponent,
  RecentActivitiesComponent,
  ResponsiveDataTableComponent,
  ResponsiveMasterSlaveComponent,
  ActionMenuBarComponent,
  ResponsiveTabContainerComponent,
  IconUploadComponent,
  DmsObjectTileComponent,
  ActionMenuButtonComponent
];

YuvComponentRegister.register(components);

/**
 * `YuvComponentsModule` contains components for creating client's basic design elements such as action menu, responsive panels, dialogs,
 * upload, tabels, file pickers etc.
 */

@NgModule({
  declarations: [...components, BusyOverlayDirective],
  exports: [...components, TabViewModule, BusyOverlayDirective],
  imports: [
    DragScrollComponent,
    DragScrollItemDirective,
    OverlayPanelModule,
    DragDropModule,
    CommonModule,
    CdkStepperModule,
    AngularSplitModule,
    AgGridModule,
    RouterModule,
    TabViewModule,
    DialogModule,
    ProgressBarModule,
    YuvPipesModule,
    YuvCommonModule,
    TranslateModule,
    YuvDirectivesModule
  ]
})
export class YuvComponentsModule { }
