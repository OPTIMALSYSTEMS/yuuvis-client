import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { SearchQuery } from './search-query.model';
import {
  SearchResult,
  SearchResultContent,
  SearchResultItem
} from './search.service.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private maxItems = 50;
  private lastSearchQuery: SearchQuery;

  constructor(private backend: BackendService) {}

  searchByQuery(q: SearchQuery): Observable<SearchResult> {
    this.lastSearchQuery = q;
    return this.search(this.queryToStatement(q));
  }

  search(
    statement: string,
    skipCount: number = 0,
    maxItems: number = this.maxItems
  ): Observable<SearchResult> {
    return this.backend
      .post(
        '/dms/objects/search',
        this.getQueryJson(statement, skipCount, maxItems),
        ApiBase.core
      )
      .pipe(
        map(res => this.toSearchResult(statement, res, skipCount, maxItems))
      );
  }

  searchRaw(
    statement: string,
    skipCount: number = 0,
    maxItems: number = this.maxItems
  ): Observable<any> {
    return this.backend.post(
      '/dms/objects/search',
      this.getQueryJson(statement, skipCount, maxItems),
      ApiBase.core
    );
  }

  getLastSearchQuery() {
    return this.lastSearchQuery;
  }

  // Generate the query JSON that will be send to the search endpont
  private getQueryJson(
    statement: string,
    skipCount: number = 0,
    maxItems?: number
  ) {
    return {
      query: {
        statement,
        skipCount,
        maxItems
        // "handleDeletedDocuments" : "DELETED_DOCUMENTS_EXCLUDE",         // optional DELETED_DOCUMENTS_INCLUDE | DELETED_DOCUMENTS_ONLY | DELETED_DOCUMENTS_EXCLUDE default: DELETED_DOCUMENTS_EXCLUDE
      }
    };
  }

  /**
   * Transform a search query to an executable statement
   * @param searchQuery The query to be processed
   */
  private queryToStatement(searchQuery: SearchQuery): string {
    let targetTypes = ['enaio:object'];
    if (searchQuery.types.length) {
      targetTypes = searchQuery.types;
    }
    return `SELECT * FROM ${targetTypes.join(',')} WHERE CONTAINS('${
      searchQuery.term
    }')`;
  }

  /**
   * Map search result from the backend to applications SearchResult object
   * @param statement The query statement executed
   * @param searchResult Sever sent result
   * @param skipCount (optional) Offset (used for paging)
   * @param maxItems  (optional) maximum number of result items (used for paging - page size)
   */
  private toSearchResult(
    statement: string,
    searchResult: any,
    skipCount?: number,
    maxItems?: number
  ): SearchResult {
    const resultListItems: SearchResultItem[] = [];
    const objectTypes: string[] = [];

    searchResult.objects.forEach(o => {
      const fields = new Map();
      Object.keys(o.properties).forEach(k => {
        fields.set(k, o.properties[k].value);
      });

      let content: SearchResultContent = null;
      if (o.contentStream) {
        content = {
          contentStreamId: o.contentStream.contentStreamId,
          fileName: o.contentStream.fileName,
          mimeType: o.contentStream.mimeType,
          size: o.contentStream.length
        };
      }

      const objectTypeId = o.properties['enaio:objectTypeId'].value;
      if (objectTypes.indexOf(objectTypeId) === -1) {
        objectTypes.push(objectTypeId);
      }

      resultListItems.push({
        objectTypeId,
        content,
        fields
      });
    });

    const result: SearchResult = {
      statement: statement,
      hasMoreItems: searchResult.hasMoreItems,
      totalNumItems: searchResult.totalNumItems,
      items: resultListItems,
      objectTypes: objectTypes
    };

    // does this result support pagination?
    if (maxItems && searchResult.totalNumItems > maxItems) {
      result.pagination = {
        pageSize: maxItems,
        pages: Math.ceil(searchResult.totalNumItems / maxItems),
        page: (!skipCount ? 0 : skipCount / maxItems) + 1
      };
    }

    return result;
  }

  /**
   * Go to a page of a search result.
   * @param searchResult The search result (that supports pagination)
   * @param page The number of the page to go to
   */
  getPage(searchResult: SearchResult, page: number): Observable<SearchResult> {
    if (!searchResult.pagination) return of(searchResult);
    if (searchResult.pagination.pages < page)
      page = searchResult.pagination.pages;

    return this.search(
      searchResult.statement,
      (page - 1) * searchResult.pagination.pageSize,
      searchResult.pagination.pageSize
    );
  }
}
