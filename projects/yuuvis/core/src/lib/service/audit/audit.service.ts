import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { AuditField, SystemType } from '../system/system.enum';
import { AuditQueryOptions, AuditQueryResult } from './audit.interface';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  // default number of items to be fetched
  private DEFAULT_RES_SIZE = 50;

  constructor(private searchService: SearchService) {}

  getAuditEntries(id: string, options?: AuditQueryOptions): Observable<AuditQueryResult> {
    const q = new SearchQuery();
    q.size = this.DEFAULT_RES_SIZE;
    q.addType(SystemType.AUDIT);
    q.addFilter(new SearchFilter(AuditField.REFERRED_OBJECT_ID, SearchFilter.OPERATOR.EQUAL, id));
    q.sortOptions = [
      {
        field: AuditField.CREATION_DATE,
        order: 'desc'
      }
    ];

    if (options) {
      if (options.size) {
        q.size = options.size;
      }
      if (options.from && options.to) {
        // range query
        q.addFilter(new SearchFilter(AuditField.CREATION_DATE, SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH, options.from, options.to));
      } else if (options.from) {
        // just one date
        q.addFilter(new SearchFilter(AuditField.CREATION_DATE, SearchFilter.OPERATOR.EQUAL, options.from));
      }
      if (options.createdBy) {
        q.addFilter(new SearchFilter(AuditField.CREATED_BY, SearchFilter.OPERATOR.EQUAL, options.createdBy));
      }
      if (options.actions && options.actions.length) {
        q.addFilter(new SearchFilter(AuditField.ACTION, SearchFilter.OPERATOR.IN, options.actions));
      }
    }
    return this.fetchAudits(q);
  }

  /**
   * Get a certain page for a former audits query.
   * @param auditsResult The result object of a former audits query
   * @param page The page to load
   */
  getPage(auditsResult: AuditQueryResult, page: number) {
    const q = auditsResult.query;
    q.from = (page - 1) * q.size;
    return this.fetchAudits(q);
  }

  private fetchAudits(q: SearchQuery): Observable<AuditQueryResult> {
    return this.searchService.searchRaw(q).pipe(
      map(res => ({
        query: q,
        items: res.objects.map(o => ({
          action: o.properties[AuditField.ACTION].value,
          detail: o.properties[AuditField.DETAIL].value,
          version: o.properties[AuditField.VERSION].value,
          creationDate: o.properties[AuditField.CREATION_DATE].value,
          createdBy: {
            id: o.properties[AuditField.CREATED_BY].value,
            title: o.properties[AuditField.CREATED_BY].title
          }
        })),
        hasMoreItems: res.hasMoreItems,
        page: !q.from ? 1 : q.from / q.size + 1
      }))
    );
  }
}
