export const SystemType = {
  DOCUMENT: 'system:document',
  FOLDER: 'system:folder',
  AUDIT: 'system:audit'
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
  TRACE_ID: 'system:traceId',
  SECONDARY_OBJECT_TYPE_IDS: 'system:secondaryObjectTypeIds',
  BASE_TYPE_ID: 'system:baseTypeId',
  OBJECT_ID: 'system:objectId'
};

export const SecondaryObjectTypeField = {
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
