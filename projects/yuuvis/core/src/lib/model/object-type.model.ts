import {
  ObjectTypeField,
  ObjectTypeProperties
} from '../service/system/system.interface';

export class ObjectType implements ObjectTypeProperties {
  id: string;
  localNamespace: string;
  description: string;
  baseId: string;
  creatable: boolean;
  contentStreamAllowed: ContentStreamAllowed;
  isFolder: boolean;
  fields: ObjectTypeField[];

  constructor(public otp: ObjectTypeProperties) {
    this.id = otp.id;
    this.baseId = otp.baseId;
    this.creatable = otp.creatable;
    this.description = otp.description;
    this.contentStreamAllowed = otp.contentStreamAllowed as ContentStreamAllowed;
    this.localNamespace = otp.localNamespace;
    this.isFolder = otp.isFolder;
    this.fields = otp.fields;
  }
}

export enum ContentStreamAllowed {
  ALLOWED = 'allowed',
  NOT_ALLOWED = 'notallowed',
  REQUIRED = 'required'
}
