import { ObjectType } from '../../model/object-type.model';

export interface SystemDefinition {
  version: number;
  lastModificationDate: any;
  objectTypes: ObjectType[];
  // the secondary object type that all object types share
  baseType: ObjectType;
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

export interface ObjectTypeField {
  id: string;
  propertyType: string;
  description?: string;
  cardinality?: string;
  required?: boolean;
  updatability?: string;
}

// base definition of the kind of data we'll receive
// from the backend asking for native schema
export interface SchemaResponse {
  version: number;
  lastModificationDate: string;
  propertyDefinition: SchemaResponsePropertyDefinition[];
  typeDocumentDefinition: SchemaResponseTypeDefinition[];
  typeFolderDefinition: SchemaResponseTypeDefinition[];
  typeSecondaryDefinition: SchemaResponseTypeDefinition[];
}

export interface SchemaResponsePropertyDefinition {
  id: string;
  description: string;
  propertyType: string;
  cardinality: string;
  required: boolean;
  updatability: string;
}
export interface SchemaResponseTypeDefinition {
  id: string;
  localNamespace: string;
  description: string;
  baseId: string;
  creatable: boolean;
  contentStreamAllowed?: string;
  propertyReference: {
    value: string;
    queryableOnChildren: boolean;
  }[];
  secondaryObjectTypeId: string[];
}
