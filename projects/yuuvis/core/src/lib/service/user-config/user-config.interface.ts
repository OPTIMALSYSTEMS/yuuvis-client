/**
 * Interface for a column configuration from object type result list
 */
export interface ColumnConfig {
  type: string;
  columns: ColumnConfigColumn[];
}
/**
 * Interface for a configuration one column
 */
export interface ColumnConfigColumn {
  /**
   * column id (matches the ID of an object type field)
   */
  id: string;
  /**
   * the columns label
   */
  label: string;
  /**
   * whether or not to sort by this column ascending or descending
   */
  sort?: 'asc' | 'desc';
  /**
   * whether or not this column should be pinned
   */
  pinned?: boolean;
}
