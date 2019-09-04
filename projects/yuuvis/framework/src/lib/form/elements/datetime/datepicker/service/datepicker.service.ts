import {Injectable} from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;
import {Moment} from 'moment';
import {PickerDay, Time, Weeks} from '../datepicker.interface';

@Injectable({
  providedIn: 'root'
})
export class DatepickerService {


  private _month: Moment;
  set month(month) {
    this._month = month;
  }

  get month(): Moment {
    return this._month;
  }

  private _weeks: Weeks[];
  set weeks(weeks: Weeks[]) {
    this._weeks = weeks;
  }

  get weeks(): Weeks[] {
    return this._weeks;
  }

  private _year: number;
  set year(year: number) {
    this._year = year;
  }

  get year(): number {
    return this._year;
  }

  futureOnly = false;

  constructor() {
  }


  isDisabledDate(date): boolean {
    if (this.futureOnly) {
      let now = moment();
      const format = 'YYYY-MM-DD HH:mm:ss';
      let start = moment.utc(date.format('YYYY-MM-DD' + ' ' + moment().format('HH:mm:ss.')), format);
      return start.toDate() <= now.toDate()
    }
    return false;
  }

  createInfo() {
    this.year = this.month.year();
    return {
      year: this.month.format('YYYY'),
      month: this.month.month()
    };
  }

  /**
   * Build a date pickers week.
   * @param firstDayOfWeek - start of the week
   * @returns
   */
  buildWeek(firstDayOfWeek) {
    let days = [];
    let date = moment(firstDayOfWeek);
    for (let i = 0; i < 7; i++) {
      let day: PickerDay = {
        number: date.date(),
        isCurrentMonth: date.month() === this.month.month(),
        isToday: date.isSame(new Date(), 'day'),
        date: date,
        disabled: this.isDisabledDate(date)
      };
      days.push(day);
      date = moment(date.toDate()).add(1, 'd');
    }
    return days;
  }

  buildMonth() {
    let weeks = [];
    // set current month to first day
    let dayOfMonth = moment(this.month).date(1).startOf('week');

    let done = false;
    //let date = start;
    let monthIndex = dayOfMonth.month();
    let count = 0;

    // split month into weeks
    while (!done) {
      weeks.push({days: this.buildWeek(dayOfMonth.toDate())});
      dayOfMonth.add(1, 'w');
      done = count++ > 2 && monthIndex !== dayOfMonth.month();
      monthIndex = dayOfMonth.month();
    }
    this.weeks = weeks;
  }

  setTime(time: Time): Time {
    time.h = time.h < 0 ? time.h = 23 : time.h;
    time.h = time.h > 23 ? time.h = 0 : time.h;
    time.m = time.m < 0 ? time.m = 59 : time.m;
    time.m = time.m > 59 ? time.m = 0 : time.m;

    return time;
  }

  setYear(year: number, min, max): number {
    if (year === undefined || year === null) {
      year = 0;
    } else if (year < min) {
      year = Math.abs(year);
    } else if (year > max) {
      year = max;
    }
    return year;
  }
}
