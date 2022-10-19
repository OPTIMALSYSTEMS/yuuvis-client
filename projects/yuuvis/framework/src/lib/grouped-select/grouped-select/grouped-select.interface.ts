/**
 * Interface for a group of`Selectables`
 */

import { SecondaryObjectType } from '@yuuvis/core';

export interface SelectableGroup {
  id: string;
  label?: string;
  /**
   * if the group element can open/close
   */
  collapsed?: boolean;
  /**
   * selectable items(objects)
   */
  items: Selectable[];
  /**
   * maximum height in pixels
   */
  maxHeight?: number;
  /**
   * hide items with zero count
   */
  hideZeroCount?: boolean;
}
/**
 * Interface for a selectable object, which is determined
 * input data of an object such as id, label, description etc.
 */
export interface Selectable {
  id: string;
  label: string;
  svgSrc?: string;
  svg?: string;
  description?: string;
  /**
   * highlighted css-class
   */
  highlight?: boolean;
  disabled?: boolean;
  count?: number;
  value?: any;
  defaultValue?: any;
  defaultOperator?: string;
  class?: string;
}

export interface FSOTSelectable {
  id: string;
  label: string;
  svgSrc?: string;
  disabled?: boolean;
  description?: string;
  prediction?: number;
  value?: SecondaryObjectType;
}
/**
 * @ignore
 */
export interface SelectableInternal extends Selectable {
  index?: number;
}
