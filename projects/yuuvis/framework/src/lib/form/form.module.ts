import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { InputMaskModule } from 'primeng/inputmask';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { YuvComponentsModule } from '../components';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { DatepickerComponent } from './elements/datetime/datepicker/datepicker.component';
import { DatetimeComponent } from './elements/datetime/datetime.component';
import { NumberComponent } from './elements/number/number.component';
import { StringComponent } from './elements/string/string.component';
import { FormInputComponent } from './form-input/form-input.component';

@NgModule({
  declarations: [FormInputComponent, CheckboxComponent, StringComponent, DatetimeComponent, NumberComponent, DatepickerComponent],
  exports: [FormInputComponent, CheckboxComponent, StringComponent, DatetimeComponent, NumberComponent],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    CalendarModule,
    TriStateCheckboxModule,
    ChipsModule,
    AutoCompleteModule,
    YuvComponentsModule,
    YuvCommonUiModule,
    InputMaskModule
  ]
})
export class YuvFormModule {}
