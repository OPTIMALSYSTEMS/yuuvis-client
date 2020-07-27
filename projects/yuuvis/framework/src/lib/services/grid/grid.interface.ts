/**
 * @ignore
 */
export interface ColumnDefinition {
  field: string;
}
/**
 * Grid column size with id and width of columns
 */
export interface ColumnSizes {
  /**
   * columns to be rendered
   */
  columns: { id: string; width: number }[];
}
