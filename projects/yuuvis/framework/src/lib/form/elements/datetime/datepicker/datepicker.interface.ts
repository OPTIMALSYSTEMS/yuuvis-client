import {Moment} from 'moment';


export type Weeks = Days[];

export interface Days {
  date: Moment;
  disabled: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  number: number;
}

export interface PickerDay {
  number: number;           // date of month
  isCurrentMonth: boolean;  // flag indicating that the day belongs to the selected month
  isToday: boolean;         // flag indicating that the day is today
  date: any;                // the day actual moment representation
  disabled: boolean;
}

export interface Time {
  h: number;
  m: number;
}
