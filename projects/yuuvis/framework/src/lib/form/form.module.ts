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
import { CatalogComponent } from './elements/catalog/catalog.component';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { DatetimeRangeComponent } from './elements/datetime-range/datetime-range.component';
import { DatepickerComponent } from './elements/datetime/datepicker/datepicker.component';
import { DatetimeComponent } from './elements/datetime/datetime.component';
import { YearRangeDirective } from './elements/datetime/year-range/year-range.directive';
import { NumberRangeComponent } from './elements/number-range/number-range.component';
import { NumberComponent } from './elements/number/number.component';
import { OrganizationComponent } from './elements/organization/organization.component';
import { ReferenceItemComponent } from './elements/reference/reference-item/reference-item.component';
import { ReferenceComponent } from './elements/reference/reference.component';
import { StringComponent } from './elements/string/string.component';
import { FormInputComponent } from './form-input/form-input.component';

/**
 * `YuvFormModule` bundles form controls like inputs, checkboxes, datepickers and so on.
 * To get a label for each form control, you can wrap it using `<yuv-form-input>`.
 */
@NgModule({
  declarations: [
    FormInputComponent,
    CheckboxComponent,
    StringComponent,
    DatetimeComponent,
    NumberComponent,
    DatepickerComponent,
    DatetimeRangeComponent,
    NumberRangeComponent,
    YearRangeDirective,
    ReferenceComponent,
    ReferenceItemComponent,
    OrganizationComponent,
    CatalogComponent
  ],
  exports: [
    FormInputComponent,
    CheckboxComponent,
    StringComponent,
    DatetimeComponent,
    NumberComponent,
    DatetimeRangeComponent,
    NumberRangeComponent,
    YearRangeDirective,
    ReferenceComponent,
    OrganizationComponent,
    CatalogComponent
  ],
  imports: [
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
    RouterModule
  ]
})
export class YuvFormModule {}
