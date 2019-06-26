import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../backend/backend.service';
import { ApiBase } from '../backend/api.enum';
import { SearchResult, SearchResultContent, SearchResultItem } from './search.service.interface';
import { map } from 'rxjs/operators';
import { SystemService } from '../system/system.service';
import { ObjectType } from '../../model/object-type.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private maxItems = 20;

  constructor(private backend: BackendService, private systemService: SystemService) { }

  search(statement: string): Observable<SearchResult> {
    const q = {
      "query": {
        "statement": statement,
        "skipCount": 0,
        "maxItems": this.maxItems
      }
    }
    return this.backend.post('/dms/objects/search', q, ApiBase.core).pipe(
      map(res => this.toSearchResult(statement, res))
    );
  }
  
  searchRaw(statement: string): Observable<any> {
    const q = {
      "query": {
        "statement": statement,
        "skipCount": 0,
        "maxItems": this.maxItems
      }
    }
    return this.backend.post('/dms/objects/search', q, ApiBase.core);
  }

  getColumnConfiguration(objectTypeId?: string): string[] {
    if(objectTypeId) {
      const objecttype: ObjectType = this.systemService.getObjectType(objectTypeId);
      return objecttype.fields.map(f => f.id);
    } else {
      return this.systemService.getBaseParamsFields()
    }
  }
  
  private toSearchResult(statement: string, searchResult: any): SearchResult {

    const resultListItems: SearchResultItem[] = [];
    const objectTypes: string[] = [];

    searchResult.objects.forEach(o => {

      const fields = new Map();
      Object.keys(o.properties).forEach(k => {
        fields.set(k, o.properties[k].value)
      });     

      let content: SearchResultContent = null;
      if(o.contentStream) {
        content = {
          contentStreamId: o.contentStream.contentStreamId,           
          fileName: o.contentStream.fileName,
          mimeType: o.contentStream.mimeType,
          size: o.contentStream.length
        }
      }

      const objectTypeId = o.properties['enaio:objectTypeId'];
      if(objectTypes.indexOf(objectTypeId) === -1) {
        objectTypes.push(objectTypeId)
      }

      resultListItems.push({
        objectTypeId: objectTypeId,
        content: content,
        fields: fields
      })      
    })

    return {
      statement: statement,
      hasMoreItems: searchResult.hasMoreItems,
      items: resultListItems,
      objectTypes: objectTypes
    }
  }
}
