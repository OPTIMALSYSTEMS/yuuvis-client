import { SearchResultItem } from '../service/search/search.service.interface';
import { BaseObjectTypeField } from '../service/system/system.enum';

export class DmsObject {
  id: string;
  title: string;
  description: string;
  version: number;
  isFolder: boolean;
  objectTypeId: string;
  data: any;

  constructor(searchResultItem: SearchResultItem, isFolder: boolean) {
    this.id = searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID);
    this.objectTypeId = searchResultItem.objectTypeId;
    this.title = searchResultItem.fields.get('clienttitle');
    this.description = searchResultItem.fields.get('clientdescription');
    this.data = this.generateData(searchResultItem.fields);
    this.isFolder = isFolder;
  }

  private generateData(fields) {
    const result = {};
    for (const [key, val] of fields.entries()) {
      result[key] = val;
    }
    return result;
  }
}
