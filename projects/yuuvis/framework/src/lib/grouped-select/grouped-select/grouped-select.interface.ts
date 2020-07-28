/**
 * Interface for a group of`Selectables`
 */

export interface SelectableGroup {
  id: string;
  label?: string;
  collapsed?: boolean;
  items: Selectable[];
}
/**
 * Interface for a selectable object
 */
export interface Selectable {
  id: string;
  label: string;
  svg?: string;
  description?: string;
  highlight?: boolean;
  disabled?: boolean;
  count?: number;
  value?: any;
}
/**
 * @ignore
 */
export interface SelectableInternal extends Selectable {
  index?: number;
}
