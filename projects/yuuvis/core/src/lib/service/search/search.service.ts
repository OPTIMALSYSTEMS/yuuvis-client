import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { ContentStreamField } from '../system/system.enum';
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

  search(q: SearchQuery): Observable<SearchResult> {
    if (!q.maxItems) {
      q.maxItems = this.maxItems;
    }
    this.lastSearchQuery = q;

    return this.backend
      .post(`/search/search?size=${this.maxItems}`, q.toJson(), ApiBase.apiWeb)
      .pipe(map(res => this.toSearchResult(q, res)));
  }

  getLastSearchQuery() {
    return this.lastSearchQuery;
  }

  /**
   * Map search result from the backend to applications SearchResult object
   * @param statement The query statement executed
   * @param searchResult Sever sent result
   * @param skipCount (optional) Offset (used for paging)
   * @param maxItems  (optional) maximum number of result items (used for paging - page size)
   */
  private toSearchResult(
    // statement: string,
    query: SearchQuery,
    searchResult: any
    // skipCount?: number,
    // maxItems?: number
  ): SearchResult {
    const resultListItems: SearchResultItem[] = [];
    const objectTypes: string[] = [];

    searchResult.objects.forEach(o => {
      const fields = new Map();

      // process properties section of result
      Object.keys(o.properties).forEach(k => {
        fields.set(k, o.properties[k].value);
      });

      // process contentStreams section of result if available.
      // Objects that don't have files attached won't have this section
      let content: SearchResultContent = null;
      if (o.contentStreams && o.contentStreams.length > 0) {
        // we assume that each result object only has ONE file attached, altough
        // this is an array and there may be more
        const contentStream = o.contentStreams[0];
        // also add contentstream related fields to the result fields
        fields.set(ContentStreamField.MIME_TYPE, contentStream.mimeType);
        fields.set(ContentStreamField.LENGTH, contentStream.length);
        fields.set(ContentStreamField.FILENAME, contentStream.fileName);

        content = {
          contentStreamId: contentStream.contentStreamId,
          repositoryId: contentStream.repositoryId,
          range: contentStream.range,
          digest: contentStream.digest,
          archivePath: contentStream.archivePath,
          fileName: contentStream.fileName,
          mimeType: contentStream.mimeType,
          size: contentStream.length
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
      // statement: statement,
      hasMoreItems: searchResult.hasMoreItems,
      totalNumItems: searchResult.totalNumItems,
      items: resultListItems,
      objectTypes: objectTypes
    };

    // does this result support pagination?
    if (query.maxItems && searchResult.totalNumItems > query.maxItems) {
      result.pagination = {
        pageSize: query.maxItems,
        pages: Math.ceil(searchResult.totalNumItems / query.maxItems),
        page: (!query.from ? 0 : query.from / query.maxItems) + 1
      };
    }

    return result;
  }

  /**
   * Go to a page of a search result.
   * @param searchResult The search result (that supports pagination)
   * @param page The number of the page to go to
   */
  getPage(
    query: SearchQuery,
    searchResult: SearchResult,
    page: number
  ): Observable<SearchResult> {
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
