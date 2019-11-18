import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { TranslateService, Utils } from '@yuuvis/core';
import { LocaleNumberPipe } from '../../../pipes/locale-number.pipe';
import { FileSizePipe } from './../../../pipes/filesize.pipe';

/**
 * Creates form input for number values.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 * 
 * ```html
<yuv-number [scale]="2"></yuv-number>
```
 *
 */
@Component({
  selector: 'yuv-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NumberComponent),
      multi: true
    }
  ]
})
export class NumberComponent implements ControlValueAccessor, Validator {
  // model value
  value;
  // inner value
  innerValue: string;
  _scale: number;
  _precision: number;
  _pattern: string;
  _grouping: boolean;
  validationErrors = [];
  numberPipe: LocaleNumberPipe | FileSizePipe;

  /**
   * Number of decimal places
   */
  @Input()
  set scale(val: number) {
    this._scale = Math.min(val || 0, 30);
  }
  get scale(): number {
    return this._scale;
  }
  /**
   * Overall amount of digits allowed (including decimal places)
   */
  @Input()
  set precision(val: number) {
    this._precision = Math.min(val || 100, 100);
  }
  get precision(): number {
    return this._precision;
  }
  /**
   *  Set to true to group number by pattern
   */
  @Input()
  set grouping(val: boolean) {
    this._grouping = val;
  }
  get grouping(): boolean {
    return this._grouping;
  }
  /**
   * The pattern to group number value by
   */
  @Input()
  set pattern(val) {
    this._pattern = val;
  }
  get pattern() {
    return this._pattern;
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  /**
   * set minimum input value
   */
  @Input() minValue: number;

  /**
   * set maximum input value
   *
   */
  @Input() maxValue: number;

  @Input() set classification(classification: string) {
    this.numberPipe = classification === 'filesize' ? new FileSizePipe(this.translate) : new LocaleNumberPipe(this.translate);
  }

  static betweenTwoNumbers(val: number, minVal: number, maxVal: number, inclusive = true) {
    const min = Math.min(minVal, maxVal);
    const max = Math.max(minVal, maxVal);

    return inclusive ? val >= min && val <= max : val > min && val < max;
  }

  constructor(private translate: TranslateService) {
    this.numberPipe = new LocaleNumberPipe(this.translate);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value != null ? value : null;
    this.innerValue = value != null ? this.numberPipe.numberToString(value, this.grouping, this.pattern, this.scale) : null;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onValueChange(evt) {
    this.validationErrors = [];

    if (Utils.isEmpty(evt)) {
      this.value = null;
      this.propagateChange(this.value);
      return;
    }

    // validate input
    const val = this.numberPipe.stringToNumber(evt);
    // general number validation
    if (isNaN(val) || typeof val !== 'number') {
      this.validationErrors.push({ key: 'number' });
    } else {
      // check precision
      const prePointDigits = this.precision - this.scale;
      if (val.toFixed(0).length > prePointDigits) {
        this.validationErrors.push({ key: 'precision', params: { prePointDigits } });
      }
      // check scale
      if (val % 1 && val.toString().split('.')[1].length > this.scale) {
        this.validationErrors.push({ key: 'scale', params: { scale: this.scale } });
      }

      // min max
      if (!Utils.isEmpty(this.minValue) && !Utils.isEmpty(this.maxValue) && !NumberComponent.betweenTwoNumbers(val, this.minValue, this.maxValue)) {
        this.validationErrors.push({ key: 'minmax', params: { minValue: this.minValue, maxValue: this.maxValue } });
      }

      if (!this.validationErrors.length) {
        this.value = val;
      }
    }
    this.propagateChange(this.value);
  }

  // called when the input looses focus
  public format() {
    if (!this.readonly && typeof this.value === 'number' && this.validationErrors.length === 0) {
      this.innerValue = this.numberPipe.numberToString(this.value, this.grouping, this.pattern, this.scale);
    }
  }

  // called when the input get focus
  public unformat() {
    if (!this.readonly && typeof this.value === 'number' && this.validationErrors.length === 0) {
      this.innerValue = this.numberPipe.transform(this.value, false);
    }
  }

  // returns null when valid else the validation object
  public validate(c: FormControl) {
    return this.validationErrors.length ? Utils.arrayToObject(this.validationErrors, 'key', err => ({ valid: false, ...err })) : null;
  }
}
