import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { AuditField, SystemType } from '../system/system.enum';
import { AuditEntry, AuditQueryOptions } from './audit.interface';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private searchService: SearchService) {}

  getAuditEntries(id: string, options?: AuditQueryOptions): Observable<AuditEntry[]> {
    const q = new SearchQuery();
    q.addType(SystemType.AUDIT);
    q.addFilter(new SearchFilter(AuditField.REFERRED_OBJECT_ID, SearchFilter.OPERATOR.EQUAL, id));
    q.sortOptions = [
      {
        field: AuditField.CREATION_DATE,
        order: 'desc'
      }
    ];

    if (options) {
      if (options.from && options.to) {
        // range query
        q.addFilter(new SearchFilter(AuditField.CREATION_DATE, SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH, options.from, options.to));
      } else {
        // just one date
        q.addFilter(new SearchFilter(AuditField.CREATION_DATE, SearchFilter.OPERATOR.EQUAL, options.from));
      }
    }

    return this.searchService.searchRaw(q).pipe(
      map(res =>
        res.objects.map(o => ({
          action: o.properties[AuditField.ACTION].value,
          detail: o.properties[AuditField.DETAIL].value,
          creationDate: o.properties[AuditField.CREATION_DATE].value,
          createdBy: {
            id: o.properties[AuditField.CREATED_BY].value,
            title: o.properties[AuditField.CREATED_BY].title
          }
        }))
      )
    );
  }
}
