import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvFormModule } from '../form/form.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { SequenceListTemplateManageComponent } from './sequence-list-template-manage/sequence-list-template-manage.component';
import { SequenceListTemplatesComponent } from './sequence-list-templates/sequence-list-templates.component';
import { SequenceListComponent } from './sequence-list/sequence-list.component';

@NgModule({
  declarations: [SequenceListComponent, SequenceListTemplateManageComponent, SequenceListTemplatesComponent],
  exports: [SequenceListComponent, SequenceListTemplatesComponent],
  imports: [CommonModule, YuvCommonModule, YuvPipesModule, ReactiveFormsModule, FormsModule, TranslateModule, YuvFormModule, DragDropModule]
})
export class YuvSequenceListModule {}
