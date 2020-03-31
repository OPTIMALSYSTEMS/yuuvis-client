import { Injectable } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * Service holding the state of applications current search query.
 */

@Injectable({
  providedIn: 'root'
})
export class AppSearchService {
  private query: SearchQuery;
  private querySource = new ReplaySubject<SearchQuery>();
  public query$: Observable<SearchQuery> = this.querySource.asObservable();

  constructor() {}

  setQuery(q: SearchQuery) {
    if (q) {
      // get rid off aggregations as they are not relevant here, but would mess
      // with comparison of incomming queries, so this service will only hold
      // queries without agg property
      q.aggs = null;
    }
    if (!this.query || JSON.stringify(this.query.toQueryJson()) !== (q ? JSON.stringify(q.toQueryJson()) : {})) {
      this.query = q;
      this.querySource.next(this.query);
    }
  }
}
