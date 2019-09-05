import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { TranslateService, YuvEnvironment } from '@yuuvis/core';
import * as moment_ from 'moment';
import 'moment/min/locales';
import { LocaleDatePipe } from '../../../pipes';
import { SVGIcons } from '../../../svg.generated';
const moment = moment_;

/**
 * Creates form input for date values. Input can be typed using a localized masked 
 * input or done by using a datepicker component.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 * 
 * ```html
<yuv-datetime [pickerTitle]="'Please select a date'"></yuv-datetime>
```
 * 
 * ```html
<yuv-datetime [withTime]="true"></yuv-datetime>
```
 *
 */
@Component({
  selector: 'yuv-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatetimeComponent),
      multi: true
    }
  ]
})
export class DatetimeComponent implements OnInit, ControlValueAccessor, Validator {
  datepickerIcon = SVGIcons.datepicker;
  params;
  value; // model value
  innerValue; // inner ng-model value
  locale;
  datePipe: LocaleDatePipe;
  showPicker = false;
  private isValid = true;
  maskPattern: string;
  _datePattern: string;
  datePattern: string;
  isWebEnv: boolean = YuvEnvironment.isWebEnvironment();
  _withTime: boolean;
  withAmPm: boolean;

  /**
   * Title for the datepicker
   */
  @Input() pickerTitle: string;
  /**
   * Whether or not to allow only values in the future (default: false)
   */
  @Input() onylFutureDates: boolean;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  /**
   * Enables setting time as well (default: false)
   */
  @Input()
  set withTime(value) {
    this._withTime = value;
    this._datePattern = this.datePipe.format(this.withTime ? 'eoShort' : 'eoShortDate');
    this.withAmPm = !!~this._datePattern.indexOf('a');
    // BUG: moment does not support 'd' & 'y' (ISO8601_DATE_REGEX)
    this.datePattern = this._datePattern
      .replace(/y/g, 'Y')
      .replace(/d/g, 'D')
      .replace(/aa/g, 'A');
    this.maskPattern = this._datePattern.replace(/[mMdDyYhH]/g, '9');
  }

  get withTime() {
    return this._withTime;
  }

  constructor(private translate: TranslateService) {
    this.datePipe = new LocaleDatePipe(translate);
    this.locale = this.translate.currentLang.replace('zh', 'zh-cn'); // BUG: moment does not support 'zh'
    moment.locale(this.locale);
  }

  formatDate(value: Date) {
    return !value ? null : this.withTime ? value.toISOString().replace(':00.000', '') : this.datePipe.transform(value, 'yyyy-MM-dd');
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value
      ? moment(value, this.datePattern)
          .seconds(0)
          .millisecond(0)
          .toDate()
      : null;
    this.setInnerValue();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setValueFromMask() {
    let m = moment(this.innerValue, this.datePattern);
    this.isValid = m.isValid();
    if (this.isValid) {
      this.value = m.toDate();
    }
    this.propagateChange(this.value);
  }

  setValueFromPicker(event) {
    this.value = event.date
      ? moment(event.date, this.datePattern)
          .seconds(0)
          .millisecond(0)
          .toDate()
      : null;
    this.setInnerValue();
    this.propagateChange(this.value);
    this.showPicker = false;
  }

  onMaskValueChange(event) {
    if (event === this._datePattern) {
      this.value = null;
      this.propagateChange(this.value);
    }
  }

  private setInnerValue() {
    if (this.value) {
      let m = moment(this.value);
      this.isValid = m.isValid();
      if (this.isValid) {
        this.innerValue = m.format(this.datePattern);
      }
    } else {
      this.innerValue = null;
    }
  }

  // returns null when valid else the validation object
  public validate(c: FormControl) {
    return this.isValid
      ? null
      : {
          datecontrol: {
            valid: false
          }
        };
  }

  ngOnInit() {
    if (this.withTime === undefined) {
      this.withTime = false;
    }
  }
}
