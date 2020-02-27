import { ObjectType } from '@yuuvis/core';

export interface ColumnConfig {
  type: string;
  columns: ColumnConfigColumn[];
}

export interface ColumnConfigColumn {
  // column id (matches the ID of an object type field)
  id: string;
  // the columns label
  label: string;
  // the type of data hold by this column (matches the property type of the object type field)
  propertyType: string;
  // whether or not to sort by this column ascending or descending
  sort?: 'asc' | 'desc';
  // whether or not this column should be pinned
  pinned?: boolean;
}

export interface ColumnConfigSelectItem {
  id: string;
  label: string;
  type: ObjectType;
}
