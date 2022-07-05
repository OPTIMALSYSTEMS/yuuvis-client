import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { YuvCommonModule } from '../common/common.module';
import { YuvFormModule } from '../form/form.module';
import { YuvComponentRegister } from './../shared/utils/utils';
import { QuickfinderEntryComponent } from './quickfinder/quickfinder-entry/quickfinder-entry.component';
import { QuickfinderComponent } from './quickfinder/quickfinder.component';

const components = [QuickfinderComponent, QuickfinderEntryComponent];

YuvComponentRegister.register(components);

/**
 * Module providing components for a quick selection an one object such as `QuickfinderComponent`.
 */
@NgModule({
  imports: [CommonModule, ReactiveFormsModule, YuvCommonModule, YuvFormModule],
  declarations: [...components],
  exports: [...components]
})
export class YuvQuickfinderModule {}
