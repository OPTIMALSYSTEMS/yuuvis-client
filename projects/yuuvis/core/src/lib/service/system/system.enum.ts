export const SystemType = {
  DOCUMENT: 'system:document',
  FOLDER: 'system:folder',
  AUDIT: 'system:audit'
};

export const AdministrationRoles = {
  ADMIN: 'YUUVIS_TENANT_ADMIN',
  SYSTEM: 'YUUVIS_SYSTEM_INTEGRATOR'
};

export const BaseObjectTypeField = {
  OBJECT_ID: 'system:objectId',
  OBJECT_TYPE_ID: 'system:objectTypeId',
  CREATION_DATE: 'system:creationDate',
  MODIFICATION_DATE: 'system:lastModificationDate',
  TENANT: 'system:tenant',
  VERSION_NUMBER: 'system:versionNumber',
  CREATED_BY: 'system:createdBy',
  MODIFIED_BY: 'system:lastModifiedBy',
  PARENT_ID: 'system:parentId',
  PARENT_OBJECT_TYPE_ID: 'system:parentObjectTypeId',
  PARENT_VERSION_NUMBER: 'system:parentVersionNumber'
};

export const SecondaryObjectTypeField = {
  TITLE: 'clienttitle',
  DESCRIPTION: 'clientdescription'
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

export const ObjectField = {
  OBJECT_TYPE_ID: 'system:objectTypeId',
  VERSION_NUMBER: 'system:versionNumber',
  OBJECT_ID: 'system:objectId'
};

export const ParentField = {
  asvaktenzeichen: 'tenKolibri:asvaktenzeichen',
  asvaktenzeichentext: 'tenKolibri:asvaktenzeichentext',
  asvsichtrechte: 'tenKolibri:asvsichtrechte',
  asvvorgangsname: 'tenKolibri:asvvorgangsname',
  asvvorgangsnummer: 'tenKolibri:asvvorgangsnummer'
};
