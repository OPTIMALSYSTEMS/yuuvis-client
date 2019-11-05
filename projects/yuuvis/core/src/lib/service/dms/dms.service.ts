import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { SearchResult, SearchResultItem } from '../search/search.service.interface';
import { BaseObjectTypeField } from '../system/system.enum';
import { SystemService } from '../system/system.service';
import { UploadService } from '../upload/upload.service';

@Injectable({
  providedIn: 'root'
})
export class DmsService {
  constructor(
    private searchService: SearchService,
    private backend: BackendService,
    private eventService: EventService,
    private uploadService: UploadService,
    private systemService: SystemService
  ) {}

  deleteDmsObject(id: string): Observable<any> {
    const url = `/dms/${id}`;
    return this.backend.delete(url, ApiBase.apiWeb);
  }

  uploadContent(objectId: string, file: File): Observable<any> {
    const url = `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/update/${objectId}/content`;
    return this.uploadService.upload(url, file);
  }

  getDmsObject(id: string, version?: number, intent?: string): Observable<DmsObject> {
    // TODO: Support version and intent params as well
    return this.getDmsObjects([id]).pipe(map(res => res[0]));
  }

  updateObject(id: string, data: any) {
    return this.backend.patch(`/dms/update/${id}`, data).pipe(
      map(res => this.searchService.toSearchResult(res)),
      map((res: SearchResult) => this.searchResultToDmsObject(res.items[0])),
      tap((_dmsObject: DmsObject) => this.eventService.trigger(YuvEventType.DMS_OBJECT_UPDATED, _dmsObject))
    );
  }

  getDmsObjects(ids: string[]): Observable<DmsObject[]> {
    const q = new SearchQuery();
    q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, ids));
    return this.searchService.search(q).pipe(map((res: SearchResult) => res.items.map(i => this.searchResultToDmsObject(i))));
  }

  private searchResultToDmsObject(resItem: SearchResultItem): DmsObject {
    return new DmsObject(resItem, this.systemService.getObjectType(resItem.objectTypeId).isFolder);
  }
}
