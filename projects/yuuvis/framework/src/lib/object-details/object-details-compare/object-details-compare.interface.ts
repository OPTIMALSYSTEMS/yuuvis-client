import { DmsObject } from '@yuuvis/core';

export interface ObjectCompareInput {
  /**
   * Title string to be shown in the components header
   */
  title?: string;
  first: {
    label: string;
    item: DmsObject;
  };
  second: {
    label: string;
    item: DmsObject;
  };
}
