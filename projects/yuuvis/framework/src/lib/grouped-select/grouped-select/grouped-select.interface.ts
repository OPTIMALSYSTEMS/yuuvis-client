// Interface for a group of `Selectables`
export interface SelectableGroup {
  id: string;
  label: string;
  items: Selectable[];
}

export interface Selectable {
  id: string;
  label: string;
  value?: any;
}

export interface SelectableGroupInternal extends SelectableGroup {
  columns?: number;
}

export interface SelectableInternal extends Selectable {
  index?: number;
}
