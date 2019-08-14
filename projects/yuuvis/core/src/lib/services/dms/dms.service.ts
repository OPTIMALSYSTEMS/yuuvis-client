import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { SearchService } from '../search/search.service';
import { SearchResult } from '../search/search.service.interface';

@Injectable({
  providedIn: 'root'
})
export class DmsService {
  constructor(private searchService: SearchService) {}

  getDmsObject(id: string): Observable<DmsObject> {
    return this.getDmsObjects([id]).pipe(map(res => res[0]));
  }

  getDmsObjects(ids: string[]): Observable<DmsObject[]> {
    const where = ids.join("' OR enaio:objectId='");
    return this.searchService
      .search(`SELECT * FROM enaio:object WHERE enaio:objectId='${where}'`)
      .pipe(map((res: SearchResult) => res.items.map(i => new DmsObject(i))));
  }
}
