import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { DatetimeComponent } from './elements/datetime/datetime.component';
import { StringComponent } from './elements/string/string.component';
import { FormInputComponent } from './form-input/form-input.component';

@NgModule({
  declarations: [FormInputComponent, CheckboxComponent, StringComponent, DatetimeComponent],
  exports: [FormInputComponent, CheckboxComponent, StringComponent, DatetimeComponent],
  imports: [CommonModule, FormsModule, CheckboxModule, CalendarModule, TriStateCheckboxModule, ChipsModule, AutoCompleteModule, YuvCommonUiModule]
})
export class YuvFormModule {}
