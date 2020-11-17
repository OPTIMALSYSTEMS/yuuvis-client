import { Component, forwardRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { DeviceService, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { LocaleDatePipe } from '../../../pipes/locale-date.pipe';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverRef } from '../../../popover/popover.ref';
import { PopoverService } from '../../../popover/popover.service';
import { datepicker } from '../../../svg.generated';

/**
 * Creates form input for date values. Input can be typed using a localized masked
 * input or done by using a datepicker component.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 *  [Screenshot](../assets/images/yuv-datetime.gif)
 *
 * @example
 * <yuv-datetime [pickerTitle]="'Please select a date'"></yuv-datetime>
 *
 * <yuv-datetime [withTime]="true"></yuv-datetime>
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
  @ViewChild('tplDatePicker') tplDatePicker: TemplateRef<any>;

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
  @Input() onlyFutureDates: boolean;
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

  constructor(
    private translate: TranslateService,
    private popoverService: PopoverService,
    private device: DeviceService,
    private iconRegistry: IconRegistryService
  ) {
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
      // bug: angular DatePipe cannot format pattern where day is before month (so I am gonna flip values & hope it works for all languages)
      const dd = this._datePattern.indexOf('dd');
      const MM = this._datePattern.indexOf('MM');
      const innerDate =
        this.innerValue &&
        dd < MM &&
        new Date(
          [...this.innerValue]
            .map((c, i) =>
              i === dd
                ? this.innerValue[MM]
                : i === dd + 1
                ? this.innerValue[MM + 1]
                : i === MM
                ? this.innerValue[dd]
                : i === MM + 1
                ? this.innerValue[dd + 1]
                : c
            )
            .join('')
        );

      const d = this.datePipe.transform(innerDate || this.innerValue, this._datePattern);
      if (this.isValidDate(d)) {
        this.value = innerDate || new Date(d);
      }
    } catch {
      this.isValid = false;
    }
    this.propagate();
  }

  openPicker() {
    const popoverConfig: PopoverConfig = {
      // width: '55%',
      // height: '70%',
      disableSmallScreenClose: true,
      data: {
        value: this.value,
        withTime: this.withTime,
        withAmPm: this.withAmPm,
        onlyFutureDates: this.onlyFutureDates
      }
    };
    this.popoverService.open(this.tplDatePicker, popoverConfig);
  }

  setValueFromPicker(event, popoverRef?: PopoverRef) {
    this.writeValue(event.date);
    this.propagate();
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onMaskValueChange(event) {
    if (event === this._datePattern || event.length === 0) {
      this.value = null;
      this.isValid = true;
      this.propagate();
    }
  }

  private setInnerValue() {
    if (this.value) {
      const d = this.datePipe.transform(this.value, this._datePattern);
      if (this.isValidDate(d)) {
        this.innerValue = d;
      }
    } else {
      this.innerValue = null;
    }
  }

  private isValidDate(date: any): boolean {
    this.isValid = this.onlyFutureDates && date ? new Date(date).getTime() >= new Date().getTime() : !!date;
    return !!date;
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
