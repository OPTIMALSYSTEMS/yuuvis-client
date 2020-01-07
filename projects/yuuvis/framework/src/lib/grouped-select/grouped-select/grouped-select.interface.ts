// Interface for a group of `Selectables`
export interface SelectableGroup {
  label: string;
  items: Selectable[];
  columns?: number;
}

export interface Selectable {
  label: string;
  value?: any;
}
