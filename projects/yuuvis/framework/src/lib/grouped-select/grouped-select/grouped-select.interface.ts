// Interface for a group of `Selectables`
export interface SelectableGroup {
  label: string;
  items: Selectable[];
}

export interface Selectable {
  label: string;
  value?: any;
}
