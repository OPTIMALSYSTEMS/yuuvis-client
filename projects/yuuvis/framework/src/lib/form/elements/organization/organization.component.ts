import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';

@Component({
  selector: 'yuv-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrganizationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => OrganizationComponent),
      multi: true
    }
  ]
})
export class OrganizationComponent implements ControlValueAccessor, Validator {
  value;
  innerValue: any[] = [];
  @Input() situation: string;
  @Input() multiselect: boolean;
  @Input() classification: string;
  @Input() readonly: boolean;
  @Input() placeholder: string;

  constructor() {}

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    if (value) {
      this.value = value;
    } else {
      this.value = null;
      this.innerValue = [];
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  validate() {
    // null means valid
    return null;
  }
}
