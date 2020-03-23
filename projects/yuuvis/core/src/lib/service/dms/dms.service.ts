import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
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

  /**
   * Create new dms object(s). Providing an array of files here instead of one will create
   * a new dms object for every file. In this case indexdata will shared across all files.
   * @param objectTypeId The ID of the object type to be created
   * @param indexdata Indexdata for the new object(s)
   * @param files File(s) to create dms objects content(s) with
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  createDmsObject(objectTypeId: string, indexdata: any, files: File[], label?: string): Observable<any> {
    const url = `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/create`;
    const data = indexdata;
    data[BaseObjectTypeField.OBJECT_TYPE_ID] = objectTypeId;
    return files.length ? this.uploadService.uploadMultipart(url, files, data, label) : this.uploadService.createDocument(url, data);
  }

  /**
   * Delete a dms object.
   * @param id ID of the object to be deleted
   */
  deleteDmsObject(id: string): Observable<any> {
    const url = `/dms/${id}`;
    return this.backend.delete(url, ApiBase.apiWeb);
  }

  /**
   * Upload (add/replace) content to a dms object.
   * @param objectId ID of the dms object to upload the file to
   * @param file The file to be uploaded
   */
  uploadContent(objectId: string, file: File): Observable<any> {
    const url = `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/update/${objectId}/content`;
    return this.uploadService.upload(url, file);
  }

  /**
   * Fetch a dms object.
   * @param id ID of the object to be retrieved
   * @param version Desired version of the object
   * @param intent
   */
  getDmsObject(id: string, version?: number, intent?: string): Observable<DmsObject> {
    return this.backend.get(`/dms/${id}${version ? '/versions/' + version : ''}`).pipe(
      map(res => {
        const item: SearchResultItem = this.searchService.toSearchResult(res).items[0];
        return this.searchResultToDmsObject(item);
      })
    );
  }

  /**
   * Update indexdata of a dms object.
   * @param id ID of the object to apply the data to
   * @param data Indexdata to be applied
   */
  updateDmsObject(id: string, data: any) {
    return this.backend.patch(`/dms/update/${id}`, data).pipe(
      map(res => this.searchService.toSearchResult(res)),
      map((res: SearchResult) => this.searchResultToDmsObject(res.items[0])),
      tap((_dmsObject: DmsObject) => this.eventService.trigger(YuvEventType.DMS_OBJECT_UPDATED, _dmsObject))
    );
  }

  /**
   * Get a bunch of dms objects.
   * @param ids List of IDs of objects to be retrieved
   */
  getDmsObjects(ids: string[]): Observable<DmsObject[]> {
    return forkJoin(ids.map(id => this.getDmsObject(id)));
  }

  /**
   * Fetch a dms object versions.
   * @param id ID of the object to be retrieved
   */
  getDmsObjectVersions(id: string): Observable<DmsObject[]> {
    return this.backend.get('/dms/objects/' + id + '/versions', 'core').pipe(
      map(res => {
        const items: SearchResultItem[] = this.searchService.toSearchResult(res).items || [];
        return items.map(item => this.searchResultToDmsObject(item));
      })
    );
  }

  private searchResultToDmsObject(resItem: SearchResultItem): DmsObject {
    return new DmsObject(resItem, this.systemService.getObjectType(resItem.objectTypeId));
  }
}
