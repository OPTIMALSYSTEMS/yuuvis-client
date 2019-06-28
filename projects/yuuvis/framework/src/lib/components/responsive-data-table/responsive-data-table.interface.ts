export interface ResponsiveTableData {
  columns: ResponsiveTableDataColumn[];
  rows: any[];
  titleField: string;
  descriptionField: string;
  selectType?: 'single' | 'multiple';
}
export interface ResponsiveTableDataColumn {
  field: string;
  headerName: string;
  resizable?: boolean;
  sortable?: boolean;
}
