/**
 * Summary input sections, which consists of individual `SummaryEntrys` elements
 */
export interface Summary {
  /**
   * Summary entry, that come from a yuuvis core
   */
  core: SummaryEntry[];
  /**
   * Summary entry, that come from a yuuvis data
   */
  data: SummaryEntry[];
  /**
   * Summary entry, that belog to the object
   */
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
  type?: string;
}
