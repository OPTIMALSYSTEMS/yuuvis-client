import { Injectable } from '@angular/core';
import { DynamicDate, PickerDay } from './../datepicker.interface';

@Injectable({
  providedIn: 'root'
})
export class DatepickerService {
  constructor() {}

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
