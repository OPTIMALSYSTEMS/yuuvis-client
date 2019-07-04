import { ColDef } from 'ag-grid-community';

export interface ResponsiveTableData {
  columns: ColDef[];
  rows: any[];
  titleField: string;
  descriptionField: string;
  selectType?: 'single' | 'multiple';
}
