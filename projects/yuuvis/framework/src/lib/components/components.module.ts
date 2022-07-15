import { AgGridModule } from '@ag-grid-community/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@yuuvis/core';
import { AngularResizeEventModule } from 'angular-resize-event';
import { AngularSplitModule } from 'angular-split';
import { DragScrollModule } from 'ngx-drag-scroll';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { YuvCommonModule } from '../common/common.module';
import { ObjectTypeIconComponent } from '../common/components/object-type-icon/object-type-icon.component';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { SingleCellRendererComponent } from '../services/grid/renderer/single-cell-renderer/single-cell-renderer.component';
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
import { SequenceListItemComponent } from './sequence-list/sequence-list-item/sequence-list-item.component';
import { SequenceListComponent } from './sequence-list/sequence-list.component';
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
  SequenceListComponent,
  ActionMenuButtonComponent
];

YuvComponentRegister.register(components);

/**
 * `YuvComponentsModule` contains components for creating client's basic design elements such as action menu, responsive panels, dialogs,
 * upload, tabels, file pickers etc.
 */

@NgModule({
  declarations: [...components, SequenceListItemComponent, BusyOverlayDirective],
  exports: [...components, TabViewModule, BusyOverlayDirective],
  imports: [
    OverlayPanelModule,
    DragDropModule,
    CommonModule,
    AngularResizeEventModule,
    CdkStepperModule,
    AngularSplitModule,
    AgGridModule.withComponents([ObjectTypeIconComponent, SingleCellRendererComponent]),
    RouterModule,
    TabViewModule,
    DialogModule,
    ProgressBarModule,
    YuvPipesModule,
    YuvCommonModule,
    TranslateModule,
    DragScrollModule,
    YuvDirectivesModule
  ]
})
export class YuvComponentsModule {}
