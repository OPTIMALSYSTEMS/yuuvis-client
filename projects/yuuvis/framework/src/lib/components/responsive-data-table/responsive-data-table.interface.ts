import { ColDef, GridOptions } from '@ag-grid-community/core';

/**
 * Responsive TableData
 */
export interface ResponsiveTableData {
  /**
   * columns definition from ag - grid settings
   */
  columns: ColDef[];
  /**
   * rows Input
   */
  rows: any[];
  sortModel?: { colId: string; sort: string }[];
  titleField: string;
  descriptionField: string;
  dateField?: string;
  selectType?: 'single' | 'multiple';
  /**
   * grid setting from ag-grid definition
   */
  gridOptions?: Partial<GridOptions>;
  /**
   * setter function for ResponsiveTableData
   */
  set?: (responsiveTableData: ResponsiveTableData) => ResponsiveTableData;
}
