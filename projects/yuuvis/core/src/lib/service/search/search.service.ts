import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RangeValue } from '../../model/range-value.model';
import { Utils } from '../../util/utils';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { BaseObjectTypeField, ContentStreamField } from '../system/system.enum';
import { SystemService } from '../system/system.service';
import { SearchQuery, transformFilters } from './search-query.model';
import { AggregateResult, Aggregation, SearchResult, SearchResultContent, SearchResultItem } from './search.service.interface';
/**
 * Providing searching of dms objects.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private lastSearchQuery: SearchQuery;
  private allFields = {
    datetime: [],
    date: [],
    table: [],
    all: []
  };

  /**
   * @ignore
   */
  constructor(private backend: BackendService, private systemService: SystemService) {
    this.systemService.system$.subscribe((system) => {
      this.allFields.all = Object.values(system.allFields);
      this.allFields.all.forEach((f: any) => {
        if (f.propertyType === 'datetime') this.allFields[f.resolution == 'date' ? 'date' : 'datetime'].push(f.id);
        if (f.propertyType === 'table') {
          this.allFields['table'].push(f.id);
          f.columnDefinitions?.forEach((c) => {
            if (c.propertyType === 'datetime') this.allFields[c.resolution == 'date' ? 'date' : 'datetime'].push(f.id + '[*].' + c.id);
          });
        }
      });
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
    return this.backend.post(`/dms/objects/search`, this.transformSearchQuery(q), ApiBase.apiWeb);
  }

  /**
   * Fetch aggragations for a given query.
   * @param q The query
   * @param aggregations List of aggregations to be fetched (e.g. `enaio:objectTypeId`
   * to get an aggregation of object types)
   */
  aggregate(q: SearchQuery, aggregations: string[]) {
    q.aggs = aggregations;
    return this.backend.post(`/dms/objects/search`, this.transformSearchQuery(q), ApiBase.apiWeb).pipe(map((res) => this.toAggregateResult(res, aggregations)));
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

  private transformSearchQuery(query: SearchQuery) {
    return transformFilters.reduce((q, fn) => fn.call(this, q, query, this.allFields), query.toQueryJson(true));
  }

  exportSearchResult(query: SearchQuery, fields?: string[], title?: string): Observable<String> {
    const q = query.clone(true);
    q.fields = fields || q.fields;
    return this.backend.post('/dms/objects/export', this.transformSearchQuery(q), ApiBase.apiWeb, { responseType: 'text', observe: 'response' }).pipe(
      tap(({ body, headers }: any) =>
        Utils.downloadBlob(body, `${headers.get('content-type')}`, title ? title : headers.get('content-disposition').match(new RegExp(/([^=]+$)/, 'g'))[0])
      ),
      map(({ body }: any) => body as string),
      catchError((error) => '')
    );
  }
}
