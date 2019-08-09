export enum BaseObjectTypeField {
  OBJECT_ID = 'enaio:objectId',
  OBJECT_TYPE_ID = 'enaio:objectTypeId',
  CREATION_DATE = 'enaio:creationDate',
  MODIFICATION_DATE = 'lastModificationDate',
  VERSION_NUMBER = 'enaio:versionNumber',
  CREATED_BY = 'enaio:createdBy',
  MODIFIED_BY = 'enaio:lastModifiedBy',
  PARENT_ID = 'enaio:parentId'
}

export enum SecondaryObjectTypeField {
  TITLE = 'clienttitle',
  DESCRIPTION = 'clientdescription'
}

export enum ContentStreamField {
  LENGTH = 'enaio:contentStreamLength',
  FILENAME = 'enaio:contentStreamFileName',
  MIME_TYPE = 'enaio:contentStreamMimeType'
}
