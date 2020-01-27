import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RangeValue } from '../../model/range-value.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { BaseObjectTypeField, ContentStreamField, SecondaryObjectTypeField } from '../system/system.enum';
import { ObjectType } from './../../model/object-type.model';
import { SearchQuery, SortOption } from './search-query.model';
import { AggregateResult, Aggregation, SearchResult, SearchResultContent, SearchResultItem } from './search.service.interface';

/**
 * @ignore
 * Creates the Model of Field Definitions
 */
export class FieldDefinition {
  constructor(public elements: any[] = [], public sortorder: any[] = [], public pinned: any[] = [], public mode?: string) {}

  getOptions(id = '') {
    const sort = (this.sortorder.find(s => s.field === id) || {}).order;
    const pinned = !!this.pinned.find(_id => _id === id);
    return { ...(sort && { sort }), ...(pinned && { pinned }) };
  }
}
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private lastSearchQuery: SearchQuery;

  constructor(private backend: BackendService) {}

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
    this.lastSearchQuery = q;

    return this.backend.post(`/dms/search`, q.toQueryJson(), ApiBase.apiWeb).pipe(map(res => this.toSearchResult(res)));
  }

  searchRaw(q: SearchQuery): Observable<any> {
    this.lastSearchQuery = q;
    return this.backend.post(`/dms/search`, q.toQueryJson(), ApiBase.apiWeb);
  }

  /**
   * Fetch aggragations for a given query.
   * @param q The query
   * @param aggregations List of aggregations to be fetched (e.g. `enaio:objectTypeId`
   * to get an aggregation of object types)
   */
  aggregate(q: SearchQuery, aggregations: string[]) {
    q.aggs = aggregations;
    return this.backend.post(`/dms/search`, q.toQueryJson(), ApiBase.apiWeb).pipe(map(res => this.toAggregateResult(res, aggregations)));
  }

  getLastSearchQuery() {
    return this.lastSearchQuery;
  }

  private toAggregateResult(searchResponse: any, aggregations?: string[]): AggregateResult {
    const agg: Aggregation[] = [];
    if (aggregations) {
      aggregations.forEach(a => {
        const ag: Aggregation = {
          aggKey: a,
          entries: searchResponse.objects.map(o => ({
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

    searchResponse.objects.forEach(o => {
      const fields = new Map();
      // process properties section of result
      Object.keys(o.properties).forEach((key: string) =>
        o.properties[key].title ? fields.set(key, o.properties[key].title) : fields.set(key, o.properties[key].value)
      );

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

      const objectTypeId = o.properties[BaseObjectTypeField.OBJECT_TYPE_ID].value;
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
   * Fake field definition service
   * @param objectType default is null (represents mixed result)
   */
  getFieldDefinition(objectType: ObjectType): Observable<FieldDefinition> {
    // TODO: use real service
    const start = [BaseObjectTypeField.OBJECT_TYPE_ID, ...Object.values(SecondaryObjectTypeField)];
    const end = [...Object.values(ContentStreamField), ...Object.values(BaseObjectTypeField).filter(f => f !== BaseObjectTypeField.OBJECT_TYPE_ID)];
    const fd = new FieldDefinition([
      ...objectType.fields.filter(f => start.includes(f.id)).sort((a, b) => start.indexOf(a.id) - start.indexOf(b.id)),
      ...objectType.fields.filter(f => !start.includes(f.id) && !end.includes(f.id)),
      ...objectType.fields.filter(f => end.includes(f.id)).sort((a, b) => end.indexOf(a.id) - end.indexOf(b.id))
    ]);
    return of(fd);
  }

  /**
   * Fake field definition service
   * @param objectType default is null (represents mixed result)
   */
  updateFieldDefinition(objectType: ObjectType, sortModel: SortOption[], pinModel: string[]): Observable<FieldDefinition> {
    // TODO: use real service
    return of(new FieldDefinition([], sortModel, pinModel));
  }
}
