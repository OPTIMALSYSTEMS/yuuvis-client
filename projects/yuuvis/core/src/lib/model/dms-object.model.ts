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
    select: false,
    edit: false,
    delete: false,
    finalize: false,
    recycle: false
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
        mimeType: searchResultItem.content.mimeType
      };
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
