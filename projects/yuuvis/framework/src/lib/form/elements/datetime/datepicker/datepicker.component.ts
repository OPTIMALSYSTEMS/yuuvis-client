import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import * as moment_ from 'moment';
import { Moment } from 'moment';
import 'moment/min/locales';
import { SVGIcons } from '../../../../svg.generated';
import { Time, Weeks } from './datepicker.interface';
import { DatepickerService } from './service/datepicker.service';

const moment = moment_;

@Component({
  selector: 'yuv-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [DatepickerService]
})
export class DatepickerComponent implements OnInit {
  arrowDownIcon = SVGIcons['arrow-down'];

  monthsShort: string[];
  weekdaysShort: string[];
  maxYear = 99999;
  minYear = 0;

  // current month shown in the picker
  set month(month: Moment) {
    this.datepickerService.month = month;
  }

  get month() {
    return this.datepickerService.month;
  }

  set weeks(weeks: Weeks[]) {
    this.datepickerService.weeks = weeks;
  }

  get weeks() {
    return this.datepickerService.weeks;
  }

  // ngModel for the year input
  set year(year: number) {
    this.datepickerService.year = year;
  }

  get year() {
    return this.datepickerService.year;
  }

  // selected date
  selected: Moment;

  // ngModel for the year input

  // ngModel for the time inputs
  time = {
    h: 0,
    m: 0
  };

  // weeks of the current month

  monthInfo = {
    month: null,
    year: null
  };

  // ISO string of the date set by the components date property (used for comparing equality)
  private _date: string;
  private initialized: boolean;
  // emitted when a new value is set by the picker
  @Output() onDateChanged = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  @Input() withTime: boolean;
  @Input() withAmPm: boolean;

  @Input()
  set onylFutureDates(enabled: boolean) {
    this.datepickerService.futureOnly = enabled ? enabled : false;
  }

  get futureOnly() {
    return this.datepickerService.futureOnly;
  }

  @Input('date')
  set date(date: any) {
    let mIso = moment(date).toISOString();
    if (this._date !== mIso) {
      this._date = mIso;
      if (this.initialized) {
        this.setCalenderDate(date, true);
      }
    }
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    let newDate;
    if (event.keyCode === 13) {
      this.selectValue();
    } else if (event.keyCode === 27) {
      this.cancel();
    } else if (event.keyCode === 37) {
      newDate = moment(this.selected).add(-1, 'd');
    } else if (event.keyCode === 38) {
      newDate = moment(this.selected).add(-7, 'd');
    } else if (event.keyCode === 39) {
      newDate = moment(this.selected).add(1, 'd');
    } else if (event.keyCode === 40) {
      newDate = moment(this.selected).add(7, 'd');
    }
    if (newDate && !this.datepickerService.isDisabledDate(newDate)) {
      this.select(newDate);
    }
    if (event.keyCode === 13 || event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.keyCode !== 27 && event.keyCode !== 13) {
      event.stopPropagation();
    }
  }

  constructor(translate: TranslateService, private datepickerService: DatepickerService) {
    const locale = translate.currentLang.replace('zh', 'zh-cn'); // BUG: moment does not support 'zh'
    moment.locale(locale);
    let startDay = moment()
      .startOf('week')
      .day();
    this.monthsShort = moment.monthsShort();
    this.weekdaysShort = moment
      .weekdaysShort()
      .slice(startDay)
      .concat(moment.weekdaysShort().slice(0, startDay));
  }

  selectValue() {
    this.onDateChanged.emit({
      date: this.selected.toDate()
    });
  }

  cancel() {
    this.onCanceled.emit({});
  }

  select(date) {
    this.selected = date;
    if (this.withTime) {
      this.selected.hour(this.time.h);
      this.selected.minute(this.time.m);
    }
    if (this.selected.month() !== this.month.month()) {
      this.setMonth(this.selected.month());
    }
    if (this.selected.year() !== this.year) {
      this.setYear(this.selected.year());
    }
  }

  focusSelection() {
    this.month.month(this.selected.month());
    this.month.year(this.selected.year());
    this.datepickerService.buildMonth();
    this.createInfo();
  }

  /**
   * Set the pickers selected date
   *
   * @param Date | string date
   * @param boolean select - if set to true the given day will be set selected
   */
  setCalenderDate(date: Date | string | Moment, select?: boolean) {
    const m = moment(date);

    if (m.isValid()) {
      this.month = m;
      // let start = moment;
      // start.date(1);
      // this.removeTime(start.day(0));
      if (select) {
        this.selected = moment(date);
      }
      if (this.withTime) {
        this.time = {
          h: m.hour(),
          m: m.minute()
        };
      }
      this.datepickerService.buildMonth();
      this.createInfo();
    }
  }

  public increment(year: number) {
    this.setYear(year + 1);
  }

  public decrement(year: number) {
    this.setYear(year - 1);
  }

  public setYear(year: number) {
    this.year = this.datepickerService.setYear(year, this.minYear, this.maxYear);
    this.month.year(this.year);
    this.datepickerService.buildMonth();
    this.createInfo();
    this.selected.year(this.year);
  }

  public timeToString(time: number): string {
    return ('0' + Math.abs(time)).slice(-2);
  }

  public setTime(time: Time) {
    this.time = this.datepickerService.setTime(time);
    this.selected.hour(this.time.h);
    this.selected.minute(this.time.m);
  }

  public setMonth(index: number) {
    this.month.month(index);
    this.datepickerService.buildMonth();
    this.createInfo();
  }

  public setDateByType(type: 'now' | 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'thisyear') {
    this.setCalenderDate(this.getDateFromType(type), true);
  }

  public getDateFromType(type: string) {
    switch (type) {
      case 'now':
        return moment();
      case 'today':
        return moment().startOf('day');
      case 'yesterday':
        return moment()
          .startOf('day')
          .add(-1, 'day');
      case 'thisweek':
        return moment().startOf('week');
      case 'thismonth':
        return moment().startOf('month');
      case 'thisyear':
        return moment().startOf('year');
    }
  }

  public isSelectedDay(day: Moment) {
    return day.isSame(this.selected, 'day');
  }

  inRange(x, min = 0, max = 11) {
    return (x - min) * (x - max) <= 0;
  }

  createInfo() {
    this.monthInfo = this.datepickerService.createInfo();
  }

  ngOnInit() {
    if (!this._date) {
      this._date = this.withTime
        ? moment().toISOString()
        : moment()
            .startOf('day')
            .toISOString();
    }
    this.setCalenderDate(this._date, true);
    this.initialized = true;
  }

  public trackByFn(index, item) {
    return index;
  }
}
