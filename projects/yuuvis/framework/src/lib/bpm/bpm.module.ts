import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, YuvCoreModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvObjectDetailsModule } from '../object-details/object-details.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvObjectPickerModule } from '../object-picker/object-picker.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvPluginsModule } from '../plugins/plugins.module';
import { ProcessDetailsComponent } from './process-details/process-details.component';
import { ProcessListEmptyComponent } from './process-list-empty/process-list-empty.component';
import { ProcessListComponent } from './process-list/process-list.component';
import { TaskDetailsAttachmentsComponent } from './task-details/task-details-attachments/task-details-attachments.component';
import { TaskDetailsHistoryComponent } from './task-details/task-details-history/task-details-history.component';
import { TaskDetailsTaskComponent } from './task-details/task-details-task/task-details-task.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { ProcessDetailsSummaryComponent } from './process-details/process-details-summary/process-details-summary.component';
import { ProcessAttachmentsComponent } from './process-attachments/process-attachments.component';

const components = [
  ProcessDetailsComponent,
  ProcessListComponent,
  TaskDetailsComponent,
  ProcessListEmptyComponent,
  TaskDetailsTaskComponent,
  TaskDetailsHistoryComponent,
  TaskDetailsAttachmentsComponent
];
@NgModule({
  imports: [
    CommonModule,
    YuvObjectFormModule,
    YuvPipesModule,
    YuvComponentsModule,
    YuvPluginsModule,
    YuvCoreModule,
    TranslateModule,
    YuvCommonModule,
    YuvObjectPickerModule,
    YuvObjectDetailsModule
  ],
  declarations: [...components, ProcessDetailsSummaryComponent, ProcessAttachmentsComponent],
  entryComponents: [...components],
  exports: [...components]
})
export class YuvBpmModule {}
