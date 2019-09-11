import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SVGIcons } from '../../../svg.generated';

/**
 * Creates form input for boolean values (checkbox).
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 * 
 * ```html
<yuv-checkbox></yuv-checkbox>
```
 *
 */
@Component({
  selector: 'yuv-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  host: { class: 'yuv-checkbox' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  value: boolean = null;
  icClear = SVGIcons.clear;

  /**
   * By default checkbox value will be either 'true' or 'false'. Setting tristate
   * property to 'true' the value could also be set to NULL, meaning not set (default: false)
   */
  @Input() tristate = false;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  //@Input() filter: any;

  constructor() {}

  reset(): void {
    this.value = null;
    this.propagateChange(this.value);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value === undefined ? null : value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onChange(value) {
    if (value === null) {
      this.value = true;
    }
    this.propagateChange(this.value);
  }
}
