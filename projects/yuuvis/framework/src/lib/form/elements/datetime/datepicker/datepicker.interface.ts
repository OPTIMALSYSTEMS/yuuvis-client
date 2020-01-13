/**
 * @ignore
 */
export type Weeks = PickerDay[];
/**
 * @ignore
 */
export type DynamicDate = 'now' | 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'thisyear';
/**
 * @ignore
 */
export interface PickerDay {
  number: number; // date of month
  isCurrentMonth: boolean; // flag indicating that the day belongs to the selected month
  isToday: boolean; // flag indicating that the day is today
  date: Date;
  disabled: boolean;
}
