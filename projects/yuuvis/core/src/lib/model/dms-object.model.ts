import { SearchResultItem } from '../service/search/search.service.interface';
import { BaseObjectTypeField } from '../service/system/system.enum';
import { SecondaryObjectTypeField } from './../service/system/system.enum';
import { DmsObjectContent, DmsObjectContext, DmsObjectRights } from './dms-object.interface';
import { ObjectType } from './object-type.model';

export class DmsObject {
  id: string;
  title: string;
  description: string;
  content: DmsObjectContent;
  data: any;
  contextFolder: DmsObjectContext;
  isFolder: boolean;
  objectTypeId: string;
  rights: DmsObjectRights = {
    readIndexData: false,
    readContent: false,
    writeIndexData: false,
    writeContent: false,
    deleteObject: false,
    deleteContent: false
  };
  contentStreamAllowed: string;
  version: number;

  constructor(searchResultItem: SearchResultItem, objectType: ObjectType) {
    this.id = searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID);
    this.objectTypeId = searchResultItem.objectTypeId;
    this.title = searchResultItem.fields.get(SecondaryObjectTypeField.TITLE);
    this.description = searchResultItem.fields.get(SecondaryObjectTypeField.DESCRIPTION);
    this.data = this.generateData(searchResultItem.fields);

    this.isFolder = objectType.isFolder;
    this.contentStreamAllowed = objectType.contentStreamAllowed;

    if (searchResultItem.content) {
      this.content = {
        contentStreamId: searchResultItem.content.contentStreamId,
        fileName: searchResultItem.content.fileName,
        size: searchResultItem.content.size,
        mimeType: searchResultItem.content.mimeType
      };
    }

    if (searchResultItem.permissions) {
      this.rights.readIndexData = searchResultItem.permissions.read && searchResultItem.permissions.read.includes('metadata');
      this.rights.readContent = searchResultItem.permissions.read && searchResultItem.permissions.read.includes('content');
      this.rights.writeIndexData = searchResultItem.permissions.write && searchResultItem.permissions.write.includes('metadata');
      this.rights.writeContent = searchResultItem.permissions.write && searchResultItem.permissions.write.includes('content');
      this.rights.deleteObject = searchResultItem.permissions.delete && searchResultItem.permissions.delete.includes('object');
      this.rights.deleteContent = searchResultItem.permissions.delete && searchResultItem.permissions.delete.includes('content');
    }

    // TODO: setup contextfolder
  }

  private generateData(fields) {
    const result = {};
    for (const [key, val] of fields.entries()) {
      result[key] = val;
    }
    return result;
  }
}
