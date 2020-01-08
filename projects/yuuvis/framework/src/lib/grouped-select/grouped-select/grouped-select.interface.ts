// Interface for a group of `Selectables`
export interface SelectableGroup {
  id: string;
  label: string;
  items: Selectable[];
  columns?: number;
}

export interface Selectable {
  id: string;
  label: string;
  value?: any;
}
