import { SearchResultItem } from '../service/search/search.service.interface';
import { BaseObjectTypeField } from '../service/system/system.enum';
import { SecondaryObjectTypeField } from './../service/system/system.enum';
import { DmsObjectContent, DmsObjectContext, DmsObjectRights } from './dms-object.interface';

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
  version: number;

  constructor(searchResultItem: SearchResultItem, isFolder: boolean) {
    this.id = searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID);
    this.objectTypeId = searchResultItem.objectTypeId;
    this.title = searchResultItem.fields.get(SecondaryObjectTypeField.TITLE);
    this.description = searchResultItem.fields.get(SecondaryObjectTypeField.DESCRIPTION);
    this.data = this.generateData(searchResultItem.fields);
    this.isFolder = isFolder;

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
