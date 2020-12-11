import { Component, ElementRef, forwardRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { TranslateService } from '@yuuvis/core';
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
  private isValidInput = true;
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
    private iconRegistry: IconRegistryService,
    private elemRef: ElementRef
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
        (this.innerValue &&
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
          )) ||
        this.innerValue;

      if (this.isValidDate(innerDate)) {
        this.writeValue(innerDate);
      }
    } catch {
      this.isValidInput = false;
    }
    this.propagate();
  }

  openPicker() {
    const popoverConfig: PopoverConfig = {
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

  onMaskValueChange(event: string) {
    if (event === this._datePattern || event.length === 0) {
      this.value = null;
      this.isValidInput = true;
      this.propagate();
    }

    // fixed pm/am formatting
    if (this.withAmPm && !event.match(/aa$|AM$|PM$/)) {
      const element = this.elemRef.nativeElement.querySelector('input');
      const caretPos = element.selectionStart;
      this.innerValue = element.value = event.slice(0, -2) + (event.match(/ma$|mm$/) ? 'aa' : event.match(/p|P/) ? 'PM' : 'AM');
      element.setSelectionRange(caretPos, caretPos);
      this.setValueFromMask(); // hotfix: required for AM/PM changes
    }
  }

  private setInnerValue() {
    this.innerValue = this.isValidDate(this.value) ? this.datePipe.transform(this.value, this._datePattern) : null;
  }

  private isValidDate(date: Date): boolean {
    const valid = !!date && !isNaN(new Date(date).getTime());
    // empty input is valid all the time
    this.isValidInput = this.onlyFutureDates && valid ? new Date(date).getTime() >= new Date().getTime() : valid || !date;
    return valid;
  }

  // returns null when valid else the validation object
  public validate(c: FormControl) {
    return this.isValidInput ? null : { datecontrol: { valid: false } };
  }

  ngOnInit() {
    if (this.withTime === undefined) {
      this.withTime = false;
    }
  }
}
