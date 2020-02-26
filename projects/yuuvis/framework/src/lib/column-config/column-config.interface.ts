import { ObjectType } from '@yuuvis/core';

export interface ColumnConfigInput {
  // Object type or object type ID
  type: ObjectType | string;
  // Context type or context type ID
  context?: ObjectType | string;
}

export interface ColumnConfig {
  type: string;
  context: string;
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
  context?: ObjectType;
}
