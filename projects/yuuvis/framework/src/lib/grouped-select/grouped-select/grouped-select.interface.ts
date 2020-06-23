// Interface for a group of `Selectables`
export interface SelectableGroup {
  id: string;
  label?: string;
  items: Selectable[];
}

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

export interface SelectableInternal extends Selectable {
  index?: number;
}
