import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './elements/checkbox/checkbox.component';
import { FormInputComponent } from './form-input/form-input.component';
import { StringComponent } from './elements/string/string.component';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { AutoCompleteModule, } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';

@NgModule({
  declarations: [
    FormInputComponent,
    CheckboxComponent,
    StringComponent
  ],
  exports: [
    FormInputComponent,
    CheckboxComponent,
    StringComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    TriStateCheckboxModule,    
    ChipsModule,
    AutoCompleteModule,
    YuvCommonUiModule
  ]
})
export class YuvFormModule { }
