import { ObjectType } from '../../model/object-type.model';

export interface SystemDefinition {
    version: number;
    lastModificationDate: any;
    objectTypes: ObjectType[];
    i18n: any
}