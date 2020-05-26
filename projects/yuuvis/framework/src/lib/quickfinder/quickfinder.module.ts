import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { YuvCommonModule } from '../common/common.module';
import { QuickfinderEntryComponent } from './quickfinder/quickfinder-entry/quickfinder-entry.component';
import { QuickfinderComponent } from './quickfinder/quickfinder.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, YuvCommonModule],
  declarations: [QuickfinderComponent, QuickfinderEntryComponent],
  exports: [QuickfinderComponent]
})
export class YuvQuickfinderModule {}
