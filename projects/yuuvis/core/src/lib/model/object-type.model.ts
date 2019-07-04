export class ObjectType {
  id: string;
  localName: string;
  localNamespace: string;
  displayName: string;
  baseId: string;
  description: string;
  creatable: boolean;
  fileable: boolean;
  fulltextIndexed: boolean;
  fields: ObjectTypeField[];

  constructor(json: any) {
    this.id = json.id;
    this.baseId = json.baseId;
    this.creatable = json.creatable;
    this.description = json.description;
    this.displayName = json.displayName;
    this.fileable = json.fileable;
    this.fulltextIndexed = json.fulltextIndexed;
    this.localName = json.localName;
    this.localNamespace = json.localNamespace;

    this.fields = json.fields;
  }
}

export interface TypeField {
  id: string;
  propertyType: string;
}
export interface ObjectTypeField extends TypeField {
  localName: string;
  displayName: string;
  description: string;
  cardinality: string;
  updatability: string;
  required: boolean;
}
