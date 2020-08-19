export const SystemType = {
  OBJECT: 'system:object',
  DOCUMENT: 'system:document',
  FOLDER: 'system:folder',
  AUDIT: 'system:audit',
  SOT: 'system:secondray'
};

export const AdministrationRoles = {
  ADMIN: 'YUUVIS_TENANT_ADMIN',
  SYSTEM: 'YUUVIS_SYSTEM_INTEGRATOR'
};

export const RetentionField = {
  EXPIRATION_DATE: 'system:rmExpirationDate',
  START_OF_RETENTION: 'system:rmStartOfRetention',
  DESTRUCTION_DATE: 'system:rmDestructionDate',
  DESTRUCTION_RETENTION: 'system:rmDestructionRetention'
};

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
  OBJECT_ID: 'system:objectId'
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
  ACTION: 'system:action'
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
  STRING_CATALOG = 'catalog',
  STRING_ORGANIZATION = 'id:organization',
  STRING_REFERENCE = 'id:reference',
  STRING_EMAIL = 'email',
  STRING_URL = 'url',
  STRING_PHONE = 'phone',
  NUMBER_FILESIZE = 'filesize',
  NUMBER_DIGIT = 'digit'
}

// classifications applied to object types
export enum ObjectTypeClassification {
  ADVANCED_FILING_OBJECT = 'appClient:dlm',
  FLOATING_OBJECT_TYPE = 'appClient:floatingType'
}

// classifications applied to secondary object types
export enum SecondaryObjectTypeClassification {
  REQUIRED = 'appClient:required',
  PRIMARY = 'appClient:primary'
}

// special internal types of object type fields
export const InternalFieldType = {
  STRING_ORGANIZATION: 'string:organization',
  STRING_REFERENCE: 'string:reference',
  STRING_CATALOG: 'string:catalog'
};
