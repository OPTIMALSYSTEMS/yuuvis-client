import { Component, forwardRef, HostListener, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { IconRegistryService } from '@yuuvis/common-ui';
import { DeviceService, TranslateService } from '@yuuvis/core';
import { LocaleDatePipe } from '../../../pipes/locale-date.pipe';
import { datepicker } from '../../../svg.generated';
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
  _withTime: boolean;
  withAmPm: boolean;

  @HostListener('document:keydown.enter', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.stopPropagation();
  }

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
    this.withAmPm = this._datePattern.includes('a');
    this.maskPattern = this._datePattern.replace(/[mMdDyYhH]/g, '9');
  }

  get withTime() {
    return this._withTime;
  }

  constructor(private translate: TranslateService, private device: DeviceService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([datepicker]);
    this.datePipe = new LocaleDatePipe(translate);
    this.locale = this.translate.currentLang;
  }

  formatDate(value: Date) {
    return !value ? null : this.withTime ? value.toISOString().replace(':00.000', '') : this.datePipe.transform(value, 'yyyy-MM-dd');
  }

  propagateChange = (_: any) => {};

  private propagate() {
    this.propagateChange(this.withTime ? this.value : this.datePipe.transform(this.value, 'yyyy-MM-dd'));
  }

  writeValue(value: any): void {
    this.value = value ? new Date(new Date(value).setSeconds(0, 0)) : null;
    this.setInnerValue();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setValueFromMask() {
    try {
      const d = this.datePipe.transform(this.innerValue, this._datePattern);
      this.isValid = !!d;
      if (this.isValid) {
        this.value = new Date(d);
      }
    } catch {
      this.isValid = false;
    }
    this.propagate();
  }

  openPicker() {
    if (this.device.isMobile) {
      // Delay opening the picker on mobile, because the keyboard may be
      // active. In this case calculating the screen estate for the dialog will
      // get a wrong height (screen minus keyboard height). So we'll wait until
      // keyboard is gone, and then trigger open.
      setTimeout(() => {
        this.showPicker = true;
      }, 500);
    } else {
      this.showPicker = true;
    }
  }

  setValueFromPicker(event) {
    this.writeValue(event.date);
    this.propagate();
    this.showPicker = false;
  }

  onMaskValueChange(event) {
    if (event === this._datePattern) {
      this.value = null;
      this.propagate();
    }
  }

  private setInnerValue() {
    if (this.value) {
      const d = this.datePipe.transform(this.value, this._datePattern);
      this.isValid = !!d;
      if (this.isValid) {
        this.innerValue = d;
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
