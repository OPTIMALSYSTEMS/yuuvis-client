export type Weeks = PickerDay[];

export type DynamicDate = 'now' | 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'thisyear';

export interface PickerDay {
  number: number; // date of month
  isCurrentMonth: boolean; // flag indicating that the day belongs to the selected month
  isToday: boolean; // flag indicating that the day is today
  date: Date;
  disabled: boolean;
}
