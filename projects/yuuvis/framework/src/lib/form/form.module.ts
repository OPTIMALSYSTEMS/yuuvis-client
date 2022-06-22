import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@yuuvis/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvPluginsModule } from './../plugins/plugins.module';
import { YuvComponentRegister } from './../shared/utils/utils';
import { CatalogComponent } from './elements/catalog/catalog.component';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { DatetimeRangeComponent } from './elements/datetime-range/datetime-range.component';
import { DatepickerComponent } from './elements/datetime/datepicker/datepicker.component';
import { DatetimeComponent } from './elements/datetime/datetime.component';
import { YearRangeDirective } from './elements/datetime/year-range/year-range.directive';
import { DynamicCatalogManagementComponent } from './elements/dynamic-catalog/dynamic-catalog-management/dynamic-catalog-management.component';
import { DynamicCatalogComponent } from './elements/dynamic-catalog/dynamic-catalog.component';
import { NumberRangeComponent } from './elements/number-range/number-range.component';
import { NumberComponent } from './elements/number/number.component';
import { OrganizationComponent } from './elements/organization/organization.component';
import { ReferenceItemComponent } from './elements/reference/reference-item/reference-item.component';
import { ReferenceComponent } from './elements/reference/reference.component';
import { StringComponent } from './elements/string/string.component';
import { FormInputComponent } from './form-input/form-input.component';

const components = [
  FormInputComponent,
  CheckboxComponent,
  StringComponent,
  DatetimeComponent,
  NumberComponent,
  DatepickerComponent,
  DatetimeRangeComponent,
  NumberRangeComponent,
  ReferenceComponent,
  ReferenceItemComponent,
  OrganizationComponent,
  CatalogComponent,
  DynamicCatalogComponent,
  DynamicCatalogManagementComponent
];

YuvComponentRegister.register(components);

/**
 * `YuvFormModule` bundles form controls like inputs, checkboxes, datepickers and so on.
 * To get a label for each form control, you can wrap it using `<yuv-form-input>`.
 */
@NgModule({
  declarations: [...components, YearRangeDirective],
  exports: [...components, YearRangeDirective],
  imports: [
    DragDropModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    CheckboxModule,
    CalendarModule,
    TriStateCheckboxModule,
    ChipsModule,
    AutoCompleteModule,
    YuvComponentsModule,
    YuvCommonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputMaskModule,
    MultiSelectModule,
    YuvPluginsModule,
    RouterModule
  ]
})
export class YuvFormModule {}
