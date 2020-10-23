import { Injectable } from '@angular/core';
import { DynamicDate, PickerDay } from './../datepicker.interface';

/**
 * Providing a kalender, that based on the user current data(time zone, date and current time).
 */
@Injectable({
  providedIn: 'root'
})
export class DatepickerService {
  /**
   * @ignore
   */
  constructor() {}

  /**
   *Build the user current week information for select a date
   * @param startDate - start date at the week, wich based on country: Monday in Europe, Sunday in USA
   * @param month - current month
   * @param isDisabled - is true, when the selected date does not match the date of the current week of the user
   */
  buildWeek(startDate: Date, month: number, isDisabled?: (date: Date) => boolean): PickerDay[] {
    const date = new Date(startDate);
    return [...new Array(7)].map((a, i) => {
      date.setHours(i ? 24 : 0, 0, 0, 0);
      return {
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === new Date().setHours(0, 0, 0, 0),
        date: new Date(date),
        disabled: isDisabled ? isDisabled(new Date(date)) : false
      };
    });
  }
  /**
   * Build the user current month information for select a date
   * @param monthDate - current month
   * @param startDay - current user day, based on country
   * @param isDisabled - is true, when the selected date does not match the date of the current month of the user
   */
  buildMonth(monthDate: Date, startDay = 0, isDisabled?: (date: Date) => boolean) {
    const weeks = [];
    const month = monthDate.getMonth();
    const firstDay = this.getDateFromType('thismonth', startDay, monthDate);
    const startDate = new Date(this.getDateFromType('thisweek', startDay, firstDay));

    // split month into weeks
    let minWeeks = 4;
    while (--minWeeks > 0 || startDate.getMonth() === month) {
      weeks.push({ days: this.buildWeek(startDate, month, isDisabled) });
      startDate.setHours(24 * 7);
    }
    return weeks;
  }
  /**
   * Provides the ability to select a specific type of date
   * @param type - type of the date, eg. now, today, yesterday, this week, this month, this year
   * @param startDay - current user date
   * @param date - selected date from date picker
   */
  getDateFromType(type: DynamicDate, startDay = 0, date?: any) {
    const d = date ? new Date(date) : new Date();
    switch (type) {
      case 'now':
        return d.setSeconds(0, 0);
      case 'today':
        return d.setHours(0, 0, 0, 0);
      case 'yesterday':
        return new Date(d.setHours(0, 0, 0, 0)).setHours(-24);
      case 'thisweek':
        return new Date(d.setHours(0, 0, 0, 0)).setHours(-24 * (d.getDay() - startDay + (startDay > d.getDay() ? 7 : 0)));
      case 'thismonth':
        return new Date(d.setHours(0, 0, 0, 0)).setDate(1);
      case 'thisyear':
        return new Date(d.setHours(0, 0, 0, 0)).setMonth(0, 1);
    }
  }
}
