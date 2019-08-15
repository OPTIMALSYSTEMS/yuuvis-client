import { SearchResultItem } from '../service/search/search.service.interface';

export class DmsObject {
  id: string;
  title: string;
  description: string;
  version: number;
  objectTypeId: string;
  data: any;

  constructor(searchResultItem: SearchResultItem) {
    this.id = searchResultItem.fields.get('enaio:objectId');
    this.objectTypeId = searchResultItem.objectTypeId;
    this.title = searchResultItem.fields.get('tenKolibri:clienttitle');
    this.description = searchResultItem.fields.get('tenKolibri:description');
    this.data = this.generateData(searchResultItem.fields);
  }

  generateData(fields) {
    const result = {};
    for (const [key, val] of fields.entries()) {
      result[key] = val;
    }
    return result;
  }
}
