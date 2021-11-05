import { AfterViewInit, Attribute, Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { clear } from '../../../svg.generated';

/**
 * Creates form input for boolean values (checkbox).
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-checkbox></yuv-checkbox>
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
export class CheckboxComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('cb') input: ElementRef;

  _value: boolean = null;
  _tabindex;

  /**
   * By default checkbox value will be either 'true' or 'false'. Setting tristate
   * property to 'true' the value could also be set to NULL, meaning not set (default: false)
   */
  @Input() tristate = false;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  @Input() set value(v: boolean) {
    if (this.tristate && v !== null && this._value === false) {
      // if (this.isSwitch && this.tristate && v !== null && ((this.value && this._value === false) || this._value === true)) {
      this._value = undefined;
    } else {
      this._value = v;
    }
    if (this.tristate && this.input) {
      this.input.nativeElement.indeterminate = this._value === undefined || this.value === null;
    }
  }

  get value() {
    return this._value;
  }
  @Output() change = new EventEmitter<boolean>();

  constructor(@Attribute('tabindex') tabindex: string, @Attribute('switch') public isSwitch: boolean, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear]);
    this._tabindex = tabindex || '0';
  }

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
    if (!this.isSwitch && value === null) {
      this.value = true;
    }
    this.change.emit(this.value);
    this.propagateChange(this.value);
  }

  ngAfterViewInit() {
    if (this.isSwitch) {
      this.input.nativeElement.indeterminate = this._value === undefined || this.value === null;
    }
  }
}
