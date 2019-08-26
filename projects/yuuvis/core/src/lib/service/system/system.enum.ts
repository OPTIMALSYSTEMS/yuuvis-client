export enum AdministrationRoles {
  ADMIN = 'YUUVIS_TENANT_ADMIN',
  SYSTEM = 'YUUVIS_SYSTEM_INTEGRATOR'
}

export enum BaseObjectTypeField {
  OBJECT_ID = 'enaio:objectId',
  OBJECT_TYPE_ID = 'enaio:objectTypeId',
  CREATION_DATE = 'enaio:creationDate',
  MODIFICATION_DATE = 'enaio:lastModificationDate',
  TENANT = 'enaio:tenant',
  VERSION_NUMBER = 'enaio:versionNumber',
  CREATED_BY = 'enaio:createdBy',
  MODIFIED_BY = 'enaio:lastModifiedBy',
  PARENT_ID = 'enaio:parentId',
  PARENT_OBJECT_TYPE_ID = 'enaio:parentObjectTypeId',
  PARENT_VERSION_NUMBER = 'enaio:parentVersionNumber'
}

export enum SecondaryObjectTypeField {
  TITLE = 'clienttitle',
  DESCRIPTION = 'clientdescription'
}

export enum ContentStreamField {
  LENGTH = 'enaio:contentStreamLength',
  MIME_TYPE = 'enaio:contentStreamMimeType',
  FILENAME = 'enaio:contentStreamFileName',
  ID = 'enaio:contentStreamId',
  RANGE = 'enaio:contentStreamRange',
  REPOSITORY_ID = 'enaio:contentStreamRepositoryId',
  DIGEST = 'enaio:digest',
  ARCHIVE_PATH = 'enaio:archivePath'
}

export enum ObjectField {
  OBJECT_TYPE_ID = 'enaio:objectTypeId',
  VERSION_NUMBER = 'enaio:versionNumber',
  OBJECT_ID = 'enaio:objectId'
}

export enum ParentField {
  asvaktenzeichen = 'tenKolibri:asvaktenzeichen',
  asvaktenzeichentext = 'tenKolibri:asvaktenzeichentext',
  asvsichtrechte = 'tenKolibri:asvsichtrechte',
  asvvorgangsname = 'tenKolibri:asvvorgangsname',
  asvvorgangsnummer = 'tenKolibri:asvvorgangsnummer'
}
