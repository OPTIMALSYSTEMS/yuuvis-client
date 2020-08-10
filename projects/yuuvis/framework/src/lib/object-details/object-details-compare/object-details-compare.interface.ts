import { DmsObject } from '@yuuvis/core';
/**
 * Objects to be compared
 */
export interface ObjectCompareInput {
  /**
   * Title string to be shown in the components header
   */
  title?: string;
  /**
   * data of the first compared object
   */
  first: {
    label: string;
    item: DmsObject;
  };
  /**
   * data of the secod compared object
   */
  second: {
    label: string;
    item: DmsObject;
  };
}
