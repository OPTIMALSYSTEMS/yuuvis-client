import { ObjectType } from '../../model/object-type.model';

export interface SystemDefinition {
  version: number;
  lastModificationDate: any;
  objectTypes: ObjectType[];
  i18n: any;
}

export interface ObjectTypeProperties {
  id: string;
  localNamespace: string;
  description: string;
  baseId: string;
  creatable: boolean;
  contentStreamAllowed?: string;
  isFolder: boolean;
  fields: ObjectTypeField[];
}

export interface ObjectTypeGroup {
  label: string;
  types: ObjectType[];
}

export interface ObjectTypeField {
  id: string;
  propertyType: string;
  description: string;
  cardinality: string;
  required: boolean;
  updatability: string;
  resolution?: string;
}

// base definition of the kind of data we'll receive
// from the backend asking for native schema
export interface SchemaResponse {
  version: number;
  lastModificationDate: string;
  objectTypes: SchemaResponseTypeDefinition[];
}

export interface SchemaResponseFieldDefinition {
  id: string;
  description: string;
  propertyType: string;
  cardinality: string;
  required: boolean;
  updatability: string;
  resolution: string;
}
export interface SchemaResponseTypeDefinition {
  id: string;
  localNamespace: string;
  description: string;
  baseId: string;
  creatable: boolean;
  fileable: boolean;
  contentStreamAllowed?: string;
  fields: SchemaResponseFieldDefinition[];
}
