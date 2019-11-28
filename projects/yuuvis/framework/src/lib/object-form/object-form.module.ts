import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { TabViewModule } from 'primeng/tabview';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvFormModule } from './../form/form.module';
import { ObjectFormEditComponent } from './object-form-edit/object-form-edit.component';
import { ObjectFormElementComponent } from './object-form-element/object-form-element.component';
import { ObjectFormGroupComponent } from './object-form-group/object-form-group.component';
import { ObjectFormComponent } from './object-form/object-form.component';

@NgModule({
  declarations: [ObjectFormComponent, ObjectFormElementComponent, ObjectFormGroupComponent, ObjectFormEditComponent],
  imports: [CommonModule, YuvCommonUiModule, ReactiveFormsModule, YuvPipesModule, YuvFormModule, TabViewModule, TranslateModule, YuvComponentsModule, YuvDirectivesModule],
  exports: [ObjectFormComponent, ObjectFormEditComponent, ObjectFormElementComponent]
})
export class YuvObjectFormModule { }
