/**
 * Summary input sections
 */
export interface Summary {
  core: SummaryEntry[];
  base: SummaryEntry[];
  extras: SummaryEntry[];
  parent: SummaryEntry[];
}
/**
 * Input data for rendering a summary for a given dms object
 */
export interface SummaryEntry {
  /**
   * label of a dms object
   */
  label: string;
  /**
   * key of a dms object
   */
  key: string;
  value: any;
  /**
   * value of a second dms object in case of comparing two objects
   */
  value2?: any;
  order?: number;
}
