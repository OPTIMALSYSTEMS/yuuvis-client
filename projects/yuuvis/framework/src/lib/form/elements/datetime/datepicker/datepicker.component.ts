import { FormStyle, getLocaleDayNames, getLocaleFirstDayOfWeek, getLocaleMonthNames, TranslationWidth } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../../../common/components/icon/service/iconRegistry.service';
import { arrowDown } from './../../../../svg.generated';
import { DynamicDate, Weeks } from './datepicker.interface';
import { DatepickerService } from './service/datepicker.service';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [DatepickerService]
})
export class DatepickerComponent implements OnInit {
  startDay: number;
  monthsShort: string[];
  weekdaysShort: string[];
  maxYear = 9999;
  minYear = 0;

  // current month shown in the picker
  weeks: Weeks[];
  current: Date;

  year: number;

  // selected date
  selected: Date;

  // emitted when a new value is set by the picker
  @Output() onDateChanged = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  @Input() withTime: boolean;
  @Input() withAmPm: boolean;

  @Input() onlyFutureDates = false;

  @Input() set date(date: any) {
    this.setCalenderDate(date, true, true);
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    let newDate: Date;
    const selected = new Date(this.selected);
    if (event.key === 'Enter') {
      this.selectValue();
    } else if (event.key === 'Escape') {
      this.cancel();
    } else if (event.key === 'ArrowLeft') {
      newDate = new Date(selected.setHours(-24));
    } else if (event.key === 'ArrowUp') {
      newDate = new Date(selected.setHours(-24 * 7));
    } else if (event.key === 'ArrowRight') {
      newDate = new Date(selected.setHours(24));
    } else if (event.key === 'ArrowDown') {
      newDate = new Date(selected.setHours(24 * 7));
    }
    if (newDate && !this.isDisabledDate(newDate, true)) {
      this.setCalenderDate(newDate);
    }
    if (['Enter', 'Escape', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' && event.key !== 'Enter') {
      event.stopPropagation();
    }
  }

  constructor(translate: TranslateService, private datepickerService: DatepickerService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([arrowDown]);
    const days = getLocaleDayNames(translate.currentLang, FormStyle.Format, TranslationWidth.Abbreviated);

    this.startDay = getLocaleFirstDayOfWeek(translate.currentLang);
    this.monthsShort = getLocaleMonthNames(translate.currentLang, FormStyle.Format, TranslationWidth.Abbreviated).map((name) => name.toString());
    this.weekdaysShort = days.slice(this.startDay).concat(days.slice(0, this.startDay));
  }

  selectValue() {
    this.onDateChanged.emit({
      date: new Date(this.selected)
    });
  }

  cancel() {
    this.onCanceled.emit({});
  }

  isDisabledDate(date: Date, startOfDay = false): boolean {
    return this.onlyFutureDates && date ? new Date(date).getTime() < (startOfDay ? new Date().setHours(0, 0, 0, 0) : new Date().getTime()) : false;
  }

  setCalenderDate(date: Date | string | number, select = true, format = false) {
    const d = date ? new Date(date) : new Date();
    const _date = format ? new Date(this.withTime ? d.setSeconds(0, 0) : d.setHours(0, 0, 0, 0)) : d;

    if (!isNaN(_date.getTime())) {
      if (select) {
        const sd = this.selected && !format ? new Date(_date).setHours(this.selected.getHours(), this.selected.getMinutes()) : _date;
        this.selected = new Date(sd);
        this.year = this.selected.getFullYear();
      }
      if (!this.current || this.current.getMonth() !== _date.getMonth() || this.current.getFullYear() !== _date.getFullYear()) {
        this.current = _date;
        this.weeks = this.datepickerService.buildMonth(this.current, this.startDay, (dd) => this.isDisabledDate(dd, true));
      }
    }
  }

  setYear(year: number) {
    this.selected.setFullYear(this.getLoop(year, this.minYear, this.maxYear));
    this.setCalenderDate(this.selected);
  }

  setMonth(month: number) {
    this.setCalenderDate(new Date(this.selected).setMonth(month), false);
  }

  setTime(h = 0, m = 0) {
    this.selected.setHours(this.getLoop(h, 0, 23), this.getLoop(m, 0, 59), 0, 0);
  }

  addTime(h = 0, m = 0) {
    this.setTime(this.selected.getHours() + h, this.selected.getMinutes() + m);
  }

  setDateByType(type: DynamicDate, emit = false) {
    this.setCalenderDate(this.datepickerService.getDateFromType(type, this.startDay), true, true);
    if (emit) {
      this.selectValue();
    }
  }

  timeToString(time: number, withAmPm = false): string {
    time = withAmPm && !this.inRange(time, 1, 12) ? time - 12 : time;
    return ('0' + Math.abs(time)).slice(-2);
  }

  isSelectedDay(day: Date) {
    return day.getTime() === new Date(this.selected).setHours(0, 0, 0, 0);
  }

  inRange(x: number = this.selected.getHours(), min = 0, max = 11) {
    return (x - min) * (x - max) <= 0;
  }

  getLoop(x: number, min: number, max: number) {
    return x < min ? max : x > max ? min : x;
  }

  ngOnInit() {
    this.setCalenderDate(this.current, true, true);
  }

  public trackByFn(index, item) {
    return index;
  }
}
