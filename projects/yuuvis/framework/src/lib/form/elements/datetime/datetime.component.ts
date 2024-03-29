import { Component, ElementRef, forwardRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormControl, Validator } from '@angular/forms';
import { TranslateService } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { fullDateFormat, LocaleDatePipe } from '../../../pipes/locale-date.pipe';
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
  datePipe: LocaleDatePipe;
  private isValidInput = true;
  maskPattern: string;
  characterPattern: string;
  _datePattern: string;
  _withTime: boolean;
  withAmPm: boolean;
  private _popoverRef: PopoverRef | undefined;
  private _pickerCloseSub: Subscription | undefined;

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
    const format = this.withTime ? 'eoShort' : 'eoShortDate';
    this._datePattern = fullDateFormat(this.datePipe.format(format), format);
    this.withAmPm = this._datePattern.includes('a');
    this.maskPattern = this._datePattern.replace(/[mMdDyYhH]/g, '9').replace(/a+$/, 'aa');
    this.characterPattern = `[ampAMP${this.datePipe.dayPeriods.join('').replace(/\./g, '')}]`;
  }

  get withTime() {
    return this._withTime;
  }

  constructor(
    public translate: TranslateService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private elemRef: ElementRef
  ) {
    this.iconRegistry.registerIcons([datepicker]);
    this.datePipe = new LocaleDatePipe(translate);
  }

  formatDate(value: Date | string) {
    const val = value instanceof Date ? value.toISOString().replace(':00.000', '') : value || null;
    return val && !this.withTime ? this.datePipe.transform(val, 'yyyy-MM-dd') : val;
  }

  propagateChange = (_: any) => {};

  private propagate() {
    this.propagateChange(this.value);
  }

  writeValue(value: any): void {
    this.value = this.formatDate(value);
    this.setInnerValue();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setValueFromMask() {
    try {
      const innerDate = this.datePipe.parse(this.innerValue, this._datePattern);
      if (this.isValidDate(innerDate)) {
        this.writeValue(innerDate);
      }
    } catch {
      this.isValidInput = false;
    }
    this.propagate();
  }

  openPicker() {
    if (!!this._pickerCloseSub) return; // already gou an open picker dialog
    const popoverConfig: PopoverConfig = {
      disableSmallScreenClose: true,
      data: {
        value: this.datePipe.fixTimezone(this.value),
        withTime: this.withTime,
        withAmPm: this.withAmPm,
        onlyFutureDates: this.onlyFutureDates
      }
    };
    this._popoverRef = this.popoverService.open(this.tplDatePicker, popoverConfig);
    this._pickerCloseSub = this._popoverRef.afterClosed().subscribe({
      next: () => {
        this._pickerCloseSub.unsubscribe();
        this._pickerCloseSub = undefined;
      }
    });
  }

  setValueFromPicker(event, popoverRef?: PopoverRef) {
    this.writeValue(event.date);
    this.propagate();
    this.elemRef.nativeElement.querySelector('input').focus();
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onMaskValueChange(event: string, maskInput: any) {
    // hotfix for aa -> ma switch
    if (this.withAmPm && this.characterPattern.includes('m')) {
      maskInput.tests[this.maskPattern.indexOf('a')] = new RegExp(`[ap${this.datePipe.dayPeriods.map((p) => p[0] || '').join('')}]`, 'i');
      maskInput.tests[this.maskPattern.indexOf('a') + 1] = new RegExp(`[m${this.datePipe.dayPeriods.map((p) => p[1] || '').join('')}]`, 'i');
    }

    if (event === this._datePattern || (event.length === 0 && this.value !== null)) {
      this.value = null;
      this.isValidInput = true;
      this.propagate();
    } else if (maskInput.buffer.every((v: any, i: any) => (maskInput.tests[i] ? maskInput.tests[i].test(v) : true))) {
      this.setValueFromMask();
    }
  }

  private setInnerValue() {
    this.innerValue = this.isValidDate(this.value) ? this.datePipe.transform(this.value, this._datePattern) : null;
  }

  private isValidDate(date: Date | string): boolean {
    const valid = !!date && !isNaN(new Date(date).getTime());
    // empty input is valid all the time
    this.isValidInput = this.onlyFutureDates && valid ? new Date((date as any).length === 10 ? date + 'T23:59:59.999' : date) > new Date() : valid || !date;
    return valid;
  }

  // returns null when valid else the validation object
  public validate(c: UntypedFormControl) {
    return this.isValidInput ? null : { datecontrol: { valid: false } };
  }

  ngOnInit() {
    if (this.withTime === undefined) {
      this.withTime = false;
    }
  }
}
