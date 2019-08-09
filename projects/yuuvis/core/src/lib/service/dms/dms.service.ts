import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { SearchResult } from '../search/search.service.interface';
import { BaseObjectTypeField } from '../system/system.enum';

@Injectable({
  providedIn: 'root'
})
export class DmsService {
  constructor(private searchService: SearchService) {}

  getDmsObject(id: string): Observable<DmsObject> {
    const q = new SearchQuery();
    q.addFilter(
      new SearchFilter(
        BaseObjectTypeField.OBJECT_ID,
        SearchFilter.OPERATOR.EQUAL,
        id
      )
    );
    return this.searchService.search(q).pipe(
      map((res: SearchResult) => {
        return res.items.map(i => new DmsObject(i))[0];
      })
    );
  }

  // getDmsObjects(ids: string[]): Observable<DmsObject[]> {
  //   const where = ids.join("' OR enaio:objectId='");
  //   // return this.searchService
  //   //   .search(`SELECT * FROM enaio:object WHERE enaio:objectId='${where}'`)
  //     // return this.backend.get(`/dms/objects/${}`, ApiBase.core)
  //     const q = new SearchQuery();
  //     q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.EQUAL, ))
  //     return this.searchService.search(`/dms/objects/${}`, ApiBase.core)
  //     .pipe(
  //       map((res: SearchResult) => {
  //         return res.items.map(i => new DmsObject(i));
  //       })
  //     );
  // }
}
