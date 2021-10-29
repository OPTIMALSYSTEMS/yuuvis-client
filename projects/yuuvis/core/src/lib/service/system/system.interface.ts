/**
 * Interface providing system definition
 */
export interface SystemDefinition {
  version: number;
  lastModificationDate: any;
  objectTypes: ObjectType[];
  secondaryObjectTypes: SecondaryObjectType[];
  i18n: Localization;
  allFields: any;
}
/**
 * Object Type interface
 */
export interface ObjectType {
  id: string;
  label?: string;
  classification?: string[];
  // localNamespace: string;
  description: string;
  baseId: string;
  creatable: boolean;
  contentStreamAllowed?: string;
  isFolder: boolean;
  // container type of a floating SOT founded type
  floatingParentType?: string;
  secondaryObjectTypes: { id: string; static?: boolean }[];
  fields: ObjectTypeField[];
}
/**
 * Interface providing secondary object type
 */
export interface SecondaryObjectType {
  id: string;
  label?: string;
  classification?: string[];
  contentStreamAllowed?: string;
  description: string;
  baseId: string;
  fields: ObjectTypeField[];
}
/**
 * Interface for the groups of object types available for the root target
 */
export interface ObjectTypeGroup {
  label: string;
  types: GroupedObjectType[];
}
/**
 * Object type to be used within ObjectTypeGroup.
 * Groups may, besides regular objectt types, also include
 * secondary object types
 */
export interface GroupedObjectType {
  id: string;
  label?: string;
  isFolder?: boolean;
  description: string;
  baseId: string;
  fields: ObjectTypeField[];
}

/**
 * Interface for a secondary object type field
 */
export interface ObjectTypeField {
  id: string;
  name: string;
  propertyType: string;
  description: string;
  cardinality: string;
  required: boolean;
  updatability: string;
  /**
   * Internal type that is generated by the system service
   * when schema is fetched. Most of the time this will match
   * the propertyType
   */

  _internalType: string;
  resolution?: string;
  classifications?: string[];
}

export interface VisibleObjectTag {
  // the tags name
  tagName: string;
  // values that should be visible. If this property is not set all values of that tag are visible
  tagValues?: any[];
}

/**
 * Base definition of the kind of data we'll receive
 * from the backend asking for native schema
 */

export interface SchemaResponse {
  version: number;
  lastModificationDate: string;
  propertyDefinition: [any];
  typeDocumentDefinition: SchemaResponseDocumentTypeDefinition[];
  typeFolderDefinition: SchemaResponseFolderTypeDefinition[];
  typeSecondaryDefinition: SchemaResponseDocumentTypeDefinition[];
}

/**
 * Interface for create the schema from the servers schema type definition response
 */
export interface SchemaResponseTypeDefinition {
  id: string;
  description?: string;
  baseId: string;
  propertyReference: { value: string }[];
  secondaryObjectTypeId: { value: string; static?: boolean }[];
  classification: string[];
}

export interface SchemaResponseFolderTypeDefinition extends SchemaResponseTypeDefinition {}
export interface SchemaResponseDocumentTypeDefinition extends SchemaResponseFolderTypeDefinition {
  contentStreamAllowed?: string;
}
/**
 * Interface for create the schema from the servers schema field definition response
 */
export interface SchemaResponseFieldDefinition {
  id: string;
  description: string;
  propertyType: string;
  cardinality: string;
  required: boolean;
  updatability: string;
  classifications?: string[];
  resolution: string;
}
// export interface SchemaResponseTypeDefinition {
//   id: string;
//   localNamespace: string;
//   description: string;
//   baseId: string;
//   creatable: boolean;
//   fileable: boolean;
//   contentStreamAllowed?: string;
//   fields: SchemaResponseFieldDefinition[];
// }

/**
 * Object type fields classification property (schema)
 */
export interface ClassificationEntry {
  classification: string;
  options: string[];
}
/**
 * Secondary object types that could be applied to a particular dms object
 */
export interface ApplicableSecondaries {
  primarySOTs: SecondaryObjectType[];
  extendingSOTs: SecondaryObjectType[];
}

export interface Localization {
  [key: string]: string;
}
