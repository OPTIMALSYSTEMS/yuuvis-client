import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { TabViewModule } from 'primeng/tabview';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvFormModule } from './../form/form.module';
import { ObjectFormEditComponent } from './object-form-edit/object-form-edit.component';
import { ObjectFormElementComponent } from './object-form-element/object-form-element.component';
import { ObjectFormGroupComponent } from './object-form-group/object-form-group.component';
import { ObjectFormComponent } from './object-form/object-form.component';

@NgModule({
  declarations: [ObjectFormComponent, ObjectFormElementComponent, ObjectFormGroupComponent, ObjectFormEditComponent],
  imports: [
    CommonModule,
    YuvCommonModule,
    ReactiveFormsModule,
    YuvPipesModule,
    YuvFormModule,
    TabViewModule,
    TranslateModule,
    YuvComponentsModule,
    YuvDirectivesModule
  ],
  exports: [ObjectFormComponent, ObjectFormEditComponent, ObjectFormElementComponent]
})
export class YuvObjectFormModule {}
