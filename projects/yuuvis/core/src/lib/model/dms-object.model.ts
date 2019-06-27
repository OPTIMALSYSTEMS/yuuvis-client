import { SearchResultItem } from '../service/search/search.service.interface';

export class DmsObject {
      
  id: string;
  title: string;
  description: string;
  version: number;
  data: any;

  constructor(searchResultItem: SearchResultItem) {
      console.log(searchResultItem);
      this.id = searchResultItem.objectTypeId;
      this.title = searchResultItem.fields.get('tenKolibri:clienttitle');
      this.description = searchResultItem.fields.get('tenKolibri:description');
  }
}