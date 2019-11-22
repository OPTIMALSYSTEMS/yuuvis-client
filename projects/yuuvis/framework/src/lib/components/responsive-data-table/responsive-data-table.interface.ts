import { ColDef } from '@ag-grid-community/core';

/**
 * Responsive TableData
 */
export interface ResponsiveTableData {
  columns: ColDef[];
  rows: any[];
  sortModel?: { colId: string; sort: string }[];
  titleField: string;
  descriptionField: string;
  selectType?: 'single' | 'multiple';
}
