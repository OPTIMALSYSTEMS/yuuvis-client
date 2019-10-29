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
    this.query = q;
    this.querySource.next(this.query);
  }
}
