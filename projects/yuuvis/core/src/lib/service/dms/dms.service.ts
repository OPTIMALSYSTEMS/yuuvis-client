import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { SearchResult } from '../search/search.service.interface';
import { BaseObjectTypeField } from '../system/system.enum';
import { SystemService } from '../system/system.service';

@Injectable({
  providedIn: 'root'
})
export class DmsService {
  constructor(
    private searchService: SearchService,
    private systemService: SystemService
  ) {}

  getDmsObject(id: string): Observable<DmsObject> {
    return this.getDmsObjects([id]).pipe(map(res => res[0]));
  }

  getDmsObjects(ids: string[]): Observable<DmsObject[]> {
    const q = new SearchQuery();
    q.addFilter(
      new SearchFilter(
        BaseObjectTypeField.OBJECT_ID,
        SearchFilter.OPERATOR.IN,
        ids
      )
    );
    return this.searchService.search(q).pipe(
      map((res: SearchResult) => {
        return res.items.map(
          i =>
            new DmsObject(
              i,
              this.systemService.getObjectType(i.objectTypeId).isFolder
            )
        );
      })
    );
  }
}
