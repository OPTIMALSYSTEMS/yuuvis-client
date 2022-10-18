import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RangeValue } from '../../model/range-value.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { BaseObjectTypeField, ContentStreamField } from '../system/system.enum';
import { SystemService } from '../system/system.service';
import { SearchFilter, SearchQuery } from './search-query.model';
import { AggregateResult, Aggregation, SearchResult, SearchResultContent, SearchResultItem } from './search.service.interface';
/**
 * Providing searching of dms objects.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private lastSearchQuery: SearchQuery;
  private _datetimeFields = [];

  /**
   * @ignore
   */
  constructor(private backend: BackendService, private systemService: SystemService) {
    this.systemService.system$.subscribe((system) => {
      this._datetimeFields = Object.values(system.allFields)
        .filter((f: any) => f.resolution !== 'date' && f.propertyType === 'datetime')
        .map((f: any) => f.id);
    });
  }

  /**
   * Creates a RangeValue instance from the given value object.
   *
   * @param value The object to be
   * @returns RangeValue
   */
  public static toRangeValue(value: any): RangeValue {
    if (value) {
      if (value instanceof RangeValue) {
        return value;
      } else if (value.hasOwnProperty('operator') && value.hasOwnProperty('firstValue')) {
        return new RangeValue(value.operator, value.firstValue, value.secondValue);
      }
    }
    return null;
  }

  search(q: SearchQuery): Observable<SearchResult> {
    return this.searchRaw(q).pipe(map((res) => this.toSearchResult(res)));
  }

  searchRaw(q: SearchQuery): Observable<any> {
    this.lastSearchQuery = q;
    return this.backend.post(`/dms/objects/search`, this.transformDateFilters(q.toQueryJson(true)), ApiBase.apiWeb);
  }

  /**
   * Fetch aggragations for a given query.
   * @param q The query
   * @param aggregations List of aggregations to be fetched (e.g. `enaio:objectTypeId`
   * to get an aggregation of object types)
   */
  aggregate(q: SearchQuery, aggregations: string[]) {
    q.aggs = aggregations;
    return this.backend
      .post(`/dms/objects/search`, this.transformDateFilters(q.toQueryJson(true)), ApiBase.apiWeb)
      .pipe(map((res) => this.toAggregateResult(res, aggregations)));
  }

  getLastSearchQuery() {
    return this.lastSearchQuery;
  }

  private toAggregateResult(searchResponse: any, aggregations?: string[]): AggregateResult {
    const agg: Aggregation[] = [];
    if (aggregations) {
      aggregations.forEach((a) => {
        const ag: Aggregation = {
          aggKey: a,
          entries: searchResponse.objects.map((o) => ({
            key: o.properties[a].value,
            count: o.properties['OBJECT_COUNT'].value
          }))
        };
        agg.push(ag);
        // agg.push(

        //   searchResponse.objects.map(o => ({
        //     key: o.properties[a].value,
        //     count: o.properties['OBJECT_COUNT'].value
        //   }))
      });
    }
    return {
      totalNumItems: searchResponse.totalNumItems,
      aggregations: agg
    };
  }

  /**
   * Map search result from the backend to applications SearchResult object
   * @param searchResponse The backend response
   */
  toSearchResult(searchResponse: any): SearchResult {
    const resultListItems: SearchResultItem[] = [];
    const objectTypes: string[] = [];

    searchResponse.objects.forEach((o) => {
      const fields = new Map();
      // process properties section of result
      Object.keys(o.properties).forEach((key: string) => {
        let value = o.properties[key].value;
        if (o.properties[key].clvalue) {
          // table fields will have a clientValue too ...
          value = o.properties[key].clvalue;
          // ... and also may contain values that need to be resolved
          if (o.properties[key].resolvedValues) {
            value.forEach((v) => {
              Object.keys(v).forEach((k) => {
                // const resValue = o.properties[key].resolvedValues[v[k]];
                const resValue = Array.isArray(v[k]) ? v[k].map((i) => o.properties[key].resolvedValues[i]) : o.properties[key].resolvedValues[v[k]];
                if (resValue) {
                  v[`${k}_title`] = resValue;
                }
              });
            });
          }
        }

        fields.set(key, value);
        if (o.properties[key].title) {
          fields.set(key + '_title', o.properties[key].title);
        }
      });

      // process contentStreams section of result if available.
      // Objects that don't have files attached won't have this section
      let content: SearchResultContent = null;
      if (o.contentStreams && o.contentStreams.length > 0) {
        // we assume that each result object only has ONE file attached, altough
        // this is an array and there may be more
        const contentStream = o.contentStreams[0];
        // also add contentstream related fields to the result fields
        fields.set(ContentStreamField.LENGTH, contentStream.length);
        fields.set(ContentStreamField.MIME_TYPE, contentStream.mimeType);
        fields.set(ContentStreamField.FILENAME, contentStream.fileName);
        fields.set(ContentStreamField.ID, contentStream.contentStreamId);
        fields.set(ContentStreamField.RANGE, contentStream.contentStreamRange);
        fields.set(ContentStreamField.REPOSITORY_ID, contentStream.repositoryId);
        fields.set(ContentStreamField.DIGEST, contentStream.digest);
        fields.set(ContentStreamField.ARCHIVE_PATH, contentStream.archivePath);

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

      const objectTypeId = o.properties[BaseObjectTypeField.OBJECT_TYPE_ID] ? o.properties[BaseObjectTypeField.OBJECT_TYPE_ID].value : null;
      if (objectTypes.indexOf(objectTypeId) === -1) {
        objectTypes.push(objectTypeId);
      }

      resultListItems.push({
        objectTypeId,
        content,
        fields,
        permissions: o.permissions
      });
    });

    const result: SearchResult = {
      hasMoreItems: searchResponse.hasMoreItems,
      totalNumItems: searchResponse.totalNumItems,
      items: resultListItems,
      objectTypes
    };
    return result;
  }

  /**
   * Go to a page of a search result.
   * @param searchResult The search result (that supports pagination)
   * @param page The number of the page to go to
   */
  getPage(query: SearchQuery, page: number): Observable<SearchResult> {
    query.from = (page - 1) * query.size;
    return this.search(query);
  }

  /**
   * Transform date filters to support exact search with seconds & milliseconds
   */
  private transformDateFilters(queryJson: any) {
    queryJson.filters?.forEach((f: any) => {
      if (f.filters) return this.transformDateFilters(f);
      if (f.v1 && this._datetimeFields.includes(f.f)) {
        const from = (v: any) => v && new Date(v).toISOString(); // :00.000Z
        const to = (v: any) => v && new Date(new Date(v).getTime() + 60 * 1000 - 1).toISOString(); // :59.999Z
        switch (f.o) {
          case SearchFilter.OPERATOR.LESS_OR_EQUAL:
          case SearchFilter.OPERATOR.GREATER_THAN:
            f.v1 = to(f.v1);
            break;
          case SearchFilter.OPERATOR.LESS_THAN:
          case SearchFilter.OPERATOR.GREATER_OR_EQUAL:
            f.v1 = from(f.v1);
            break;
          case SearchFilter.OPERATOR.EQUAL:
            f.o = SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH;
          case SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH:
            f.v1 = from(f.v1);
            f.v2 = to(f.v2 || f.v1);
            break;
          case SearchFilter.OPERATOR.INTERVAL_INCLUDE_FROM:
            f.v1 = from(f.v1);
            f.v2 = from(f.v2);
            break;
          case SearchFilter.OPERATOR.INTERVAL_INCLUDE_TO:
            f.v1 = to(f.v1);
            f.v2 = to(f.v2);
            break;
          case SearchFilter.OPERATOR.INTERVAL:
            f.v1 = to(f.v1);
            f.v2 = from(f.v2);
            break;
        }
      }
    });
    return queryJson;
  }
}
