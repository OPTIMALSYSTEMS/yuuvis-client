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
  isFolder: boolean;
  fields: ObjectTypeField[];

  constructor(public otp: ObjectTypeProperties) {
    this.id = otp.id;
    this.baseId = otp.baseId;
    this.creatable = otp.creatable;
    this.description = otp.description;
    this.localNamespace = otp.localNamespace;
    this.isFolder = otp.isFolder;
    this.fields = otp.fields;
  }
}
