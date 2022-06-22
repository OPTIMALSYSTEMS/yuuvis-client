import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { TabViewModule } from 'primeng/tabview';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFloatingSotSelectModule } from '../floating-sot-select/floating-sot-select.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvFormModule } from './../form/form.module';
import { YuvComponentRegister } from './../shared/utils/utils';
import { CombinedObjectFormComponent } from './combined-object-form/combined-object-form.component';
import { ExpandedTableComponent } from './form-element-table/expanded-table/expanded-table.component';
import { FormElementTableComponent } from './form-element-table/form-element-table.component';
import { RowEditComponent } from './form-element-table/row-edit/row-edit.component';
import { ObjectFormEditComponent } from './object-form-edit/object-form-edit.component';
import { FormElementDescriptionComponent } from './object-form-element/form-element-description/form-element-description.component';
import { ObjectFormElementComponent } from './object-form-element/object-form-element.component';
import { ObjectFormGroupComponent } from './object-form-group/object-form-group.component';
import { ObjectFormComponent } from './object-form/object-form.component';

const components = [
  ObjectFormComponent,
  ObjectFormElementComponent,
  ObjectFormGroupComponent,
  ObjectFormEditComponent,
  CombinedObjectFormComponent,
  FormElementTableComponent,
  RowEditComponent,
  ExpandedTableComponent,
  FormElementDescriptionComponent
];

YuvComponentRegister.register(components);

/**
 * Module provides components for creating for a dms object.
 * These include: object form component, object form edit component and object form element component.
 */

@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [
    CommonModule,
    YuvCommonModule,
    ReactiveFormsModule,
    YuvPipesModule,
    YuvFormModule,
    YuvFloatingSotSelectModule,
    TabViewModule,
    TranslateModule,
    YuvComponentsModule,
    YuvDirectivesModule,
    YuvGroupedSelectModule,
    AgGridModule
  ]
})
export class YuvObjectFormModule {}
