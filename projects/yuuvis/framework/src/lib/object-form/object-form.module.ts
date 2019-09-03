import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { TabViewModule } from 'primeng/tabview';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvFormModule } from './../form/form.module';
import { ObjectFormElementComponent } from './object-form-element/object-form-element.component';
import { ObjectFormGroupComponent } from './object-form-group/object-form-group.component';
import { ObjectFormComponent } from './object-form/object-form.component';

@NgModule({
  declarations: [ObjectFormComponent, ObjectFormElementComponent, ObjectFormGroupComponent],
  imports: [CommonModule, ReactiveFormsModule, YuvPipesModule, YuvFormModule, TabViewModule, TranslateModule],
  exports: [ObjectFormComponent]
})
export class YuvObjectFormModule {}
