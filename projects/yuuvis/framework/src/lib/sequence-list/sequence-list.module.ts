import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvFormModule } from '../form/form.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { SequenceListItemComponent } from './sequence-list/sequence-list-item/sequence-list-item.component';
import { SequenceListComponent } from './sequence-list/sequence-list.component';

@NgModule({
  declarations: [SequenceListComponent, SequenceListItemComponent],
  exports: [SequenceListComponent],
  imports: [CommonModule, YuvCommonModule, YuvPipesModule, ReactiveFormsModule, TranslateModule, YuvFormModule, DragDropModule]
})
export class YuvSequenceListModule {}
