import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvFormModule } from '../form/form.module';
import { YuvObjectDetailsModule } from '../object-details/object-details.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvObjectPickerModule } from '../object-picker/object-picker.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvPluginsModule } from '../plugins/plugins.module';
import { YuvComponentRegister } from '../shared/utils/utils';
import { FollowUpDetailsComponent } from './follow-up-details/follow-up-details.component';
import { PluginBpmComponent } from './plugin-bpm.component';
import { ProcessAttachmentsOrderComponent } from './process-attachments/process-attachments-order/process-attachments-order.component';
import { ProcessAttachmentsComponent } from './process-attachments/process-attachments.component';
import { ProcessDetailsSummaryComponent } from './process-details/process-details-summary/process-details-summary.component';
import { ProcessDetailsComponent } from './process-details/process-details.component';
import { ProcessListEmptyComponent } from './process-list-empty/process-list-empty.component';
import { ProcessListComponent } from './process-list/process-list.component';
import { TaskDetailsAttachmentsComponent } from './task-details/task-details-attachments/task-details-attachments.component';
import { TaskDetailsCommentsComponent } from './task-details/task-details-comments/task-details-comments.component';
import { TaskDetailsHistoryComponent } from './task-details/task-details-history/task-details-history.component';
import { TaskDelegatePickerComponent } from './task-details/task-details-task/task-delegate-picker/task-delegate-picker.component';
import { TaskDetailsTaskComponent } from './task-details/task-details-task/task-details-task.component';
import { TaskDetailsComponent } from './task-details/task-details.component';

const components = [
  FollowUpDetailsComponent,
  ProcessAttachmentsComponent,
  ProcessAttachmentsOrderComponent,
  ProcessDetailsSummaryComponent,
  ProcessDetailsComponent,
  ProcessListComponent,
  ProcessListEmptyComponent,
  TaskDetailsAttachmentsComponent,
  TaskDetailsComponent,
  TaskDetailsHistoryComponent,
  TaskDetailsTaskComponent,
  TaskDelegatePickerComponent,
  TaskDetailsCommentsComponent,
  PluginBpmComponent
];

YuvComponentRegister.register(components);

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    YuvObjectFormModule,
    YuvPipesModule,
    YuvComponentsModule,
    YuvPluginsModule,
    YuvCoreModule,
    YuvFormModule,
    TranslateModule,
    YuvCommonModule,
    DragDropModule,
    YuvObjectPickerModule,
    YuvObjectDetailsModule
  ],
  declarations: [...components],
  exports: [...components]
})
export class YuvBpmModule { }
