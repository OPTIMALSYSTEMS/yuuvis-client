import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { DatetimeRangeComponent } from './elements/datetime-range/datetime-range.component';
import { DatepickerComponent } from './elements/datetime/datepicker/datepicker.component';
import { DatetimeComponent } from './elements/datetime/datetime.component';
import { YearRangeDirective } from './elements/datetime/year-range/year-range.directive';
import { NumberRangeComponent } from './elements/number-range/number-range.component';
import { NumberComponent } from './elements/number/number.component';
import { ReferenceComponent } from './elements/reference/reference.component';
import { StringComponent } from './elements/string/string.component';
import { FormInputComponent } from './form-input/form-input.component';
import { ReferenceItemComponent } from './elements/reference/reference-item/reference-item.component';

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
    ReferenceItemComponent
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
    ReferenceComponent
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
    InputMaskModule
  ]
})
export class YuvFormModule {}
