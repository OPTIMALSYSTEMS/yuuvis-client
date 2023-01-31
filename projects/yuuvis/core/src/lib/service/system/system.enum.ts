export const TENANT_HEADER = 'X-ID-TENANT-NAME';

export const SystemType = {
  OBJECT: 'system:object',
  DOCUMENT: 'system:document',
  FOLDER: 'system:folder',
  AUDIT: 'system:audit',
  SOT: 'system:secondray'
};

export const AdministrationRoles = {
  ADMIN: 'YUUVIS_TENANT_ADMIN',
  SYSTEM: 'YUUVIS_SYSTEM_INTEGRATOR',
  MANAGE_SETTINGS: 'YUUVIS_MANAGE_SETTINGS'
};

export const UserRoles = {
  MULTI_TENANT: 'YUUVIS_MULTI_TENANT'
};

export const SystemSOT = {
  DESTRUCTION_RETENTION: 'system:rmDestructionRetention'
};

export const RetentionField = {
  RETENTION_END: 'system:rmExpirationDate',
  RETENTION_START: 'system:rmStartOfRetention',
  DESTRUCTION_DATE: 'system:rmDestructionDate'
};

export enum RetentionState {
  // no retention
  NONE = 0,
  // retention is active
  ACTIVE = 1,
  // supposed to be destructed
  DESTRUCT = 2
}

export const BaseObjectTypeField = {
  OBJECT_TYPE_ID: 'system:objectTypeId',
  VERSION_NUMBER: 'system:versionNumber',
  CREATION_DATE: 'system:creationDate',
  CREATED_BY: 'system:createdBy',
  MODIFICATION_DATE: 'system:lastModificationDate',
  MODIFIED_BY: 'system:lastModifiedBy',
  ...RetentionField,
  PARENT_ID: 'system:parentId',
  PARENT_OBJECT_TYPE_ID: 'system:parentObjectTypeId',
  PARENT_VERSION_NUMBER: 'system:parentVersionNumber',
  TENANT: 'system:tenant',
  ACL: 'system:acl',
  TRACE_ID: 'system:traceId',
  SECONDARY_OBJECT_TYPE_IDS: 'system:secondaryObjectTypeIds',
  BASE_TYPE_ID: 'system:baseTypeId',
  TAGS: 'system:tags',
  OBJECT_ID: 'system:objectId',
  // TODO: replace by actual system field identifier once available
  LEADING_OBJECT_TYPE_ID: 'appClientsystem:leadingTypeId'
};

// Fields provided by a special secondary object type that most of
// the object types should have applied to them
export const ClientDefaultsObjectTypeField = {
  TITLE: 'appClient:clienttitle',
  DESCRIPTION: 'appClient:clientdescription'
};

export const ContentStreamField = {
  LENGTH: 'system:contentStreamLength',
  MIME_TYPE: 'system:contentStreamMimeType',
  FILENAME: 'system:contentStreamFileName',
  ID: 'system:contentStreamId',
  RANGE: 'system:contentStreamRange',
  REPOSITORY_ID: 'system:contentStreamRepositoryId',
  DIGEST: 'system:digest',
  ARCHIVE_PATH: 'system:archivePath'
};

export const AuditField = {
  REFERRED_OBJECT_ID: 'system:referredObjectId',
  CREATION_DATE: 'system:creationDate',
  VERSION: 'system:versionNumber',
  DETAIL: 'system:detail',
  CREATED_BY: 'system:createdBy',
  ACTION: 'system:action',
  SUBACTION: 'system:subaction'
};

export const ParentField = {
  asvaktenzeichen: 'tenKolibri:asvaktenzeichen',
  asvaktenzeichentext: 'tenKolibri:asvaktenzeichentext',
  asvsichtrechte: 'tenKolibri:asvsichtrechte',
  asvvorgangsname: 'tenKolibri:asvvorgangsname',
  asvvorgangsnummer: 'tenKolibri:asvvorgangsnummer'
};

export enum ContentStreamAllowed {
  ALLOWED = 'allowed',
  NOT_ALLOWED = 'notallowed',
  REQUIRED = 'required'
}

// classifications applied to object type fields
export enum Classification {
  STRING_CATALOG_CUSTOM = 'custom:catalog',
  STRING_CATALOG_DYNAMIC = 'dynamic:catalog',
  STRING_CATALOG = 'catalog',
  STRING_ORGANIZATION = 'id:organization',
  STRING_ORGANIZATION_SET = 'id:organization:set',
  STRING_REFERENCE = 'id:reference',
  STRING_EMAIL = 'email',
  STRING_URL = 'url',
  STRING_PHONE = 'phone',
  NUMBER_FILESIZE = 'filesize',
  NUMBER_DIGIT = 'digit',
  BOOLEAN_SWITCH = 'switch',
  SYSTEM_SOT = 'systemsot',
  PREDICTION_CLASSIFY = 'prediction:classify',
  TABLE_SORTABLE = 'sortable'
}

// classifications applied to object types
export enum ObjectTypeClassification {
  SEARCH_FALSE = 'appClient:search:false',
  CREATE_FALSE = 'appClient:create:false',
  OBJECT_TYPE_ICON = 'appClient:icon'
}

// classifications applied to object types
export enum ObjectTypePropertyClassification {
  SUMMARY_HIDDEN = 'appClient:summary:hidden'
}

// classifications applied to secondary object types
export enum SecondaryObjectTypeClassification {
  REQUIRED = 'appClient:required',
  PRIMARY = 'appClient:primary',
  EXTENSION_ADD_FALSE = 'appClient:extension:add:false',
  EXTENSION_REMOVE_FALSE = 'appClient:extension:remove:false'
}

// special internal types of object type fields
export const InternalFieldType = {
  STRING_ORGANIZATION_SET: 'string:organization:set',
  STRING_ORGANIZATION: 'string:organization',
  STRING_REFERENCE: 'string:reference',
  STRING_CATALOG: 'string:catalog',
  STRING_DYNAMIC_CATALOG: 'string:catalog:dynamic',
  BOOLEAN_SWITCH: 'boolean:switch'
};

export enum ObjectTag {
  AFO = 'appclient:dlm:prepare'
}

// possible states of a DLM item
export const AFO_STATE = {
  // created but no FSOT assigned so far
  IN_PROGRESS: 0,
  // an FSOT has been assigned
  READY: 1
};

export const ColumnConfigSkipFields = [
  BaseObjectTypeField.OBJECT_ID,
  BaseObjectTypeField.OBJECT_TYPE_ID,
  BaseObjectTypeField.PARENT_ID,
  BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
  BaseObjectTypeField.PARENT_VERSION_NUMBER,
  BaseObjectTypeField.TENANT,
  BaseObjectTypeField.TRACE_ID,
  // BaseObjectTypeField.TAGS,
  BaseObjectTypeField.BASE_TYPE_ID,
  ContentStreamField.ID,
  ContentStreamField.RANGE,
  ContentStreamField.REPOSITORY_ID,
  ContentStreamField.DIGEST,
  ContentStreamField.ARCHIVE_PATH
];
