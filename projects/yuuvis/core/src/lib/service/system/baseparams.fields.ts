import { ObjectTypeField } from '../../model/object-type.model';

// Field definitions that reprensent the base params for
// yuuvis objects. Base params are meant to be properties
// that every object inside yuuvis share. In addition to
// that objects may have object specific fields.

// Be aware that those base param fields are also part of
// the object type fields.

// The purpose of this fields array is to identify those
// fields and be able to e.g. create a column configuration
// for a mixed result list.
export const BASE_PARAM_FIELDS: ObjectTypeField[] = [
  {
    id: 'enaio:objectId',
    cardinality: 'single',
    propertyType: 'id'
  },
  {
    id: 'enaio:objectTypeId',
    cardinality: 'single',
    propertyType: 'id'
  },
  {
    id: 'enaio:creationDate',
    cardinality: 'single',
    propertyType: 'datetime'
  },
  {
    id: 'enaio:createdBy',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:lastModificationDate',
    cardinality: 'single',
    propertyType: 'datetime'
  },
  {
    id: 'enaio:lastModifiedBy',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:versionNumber',
    cardinality: 'single',
    propertyType: 'integer'
  },
  // content stream fields
  {
    id: 'enaio:contentStreamId',
    cardinality: 'single',
    propertyType: 'id'
  },
  {
    id: 'enaio:contentStreamRange',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:contentStreamRepositoryId',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:contentStreamFileName',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:contentStreamMimeType',
    cardinality: 'single',
    propertyType: 'string'
  },
  {
    id: 'enaio:contentStreamLength',
    cardinality: 'single',
    propertyType: 'integer'
  }
];
