import { ObjectFormOptions } from '../object-form.interface';

// data to be passed to the table component
export interface TableComponentParams {
  // current form situation (EDIT, SEARCH or CREATE)
  situation: string;
  // the tables from element
  element: any;
}

// representation of a row while editing
export interface EditRow {
  situation: string;
  index: number;
  formOptions: ObjectFormOptions;
  tableElement: any;
}

// result of editing a tables row
export interface EditRowResult {
  index: number;
  rowData: any;
  createNewRow: boolean;
}
