import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { Utils } from '../../util/utils';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { SearchService } from '../search/search.service';
import { SearchResultItem } from '../search/search.service.interface';
import { BaseObjectTypeField } from '../system/system.enum';
import { SystemService } from '../system/system.service';
import { UploadService } from '../upload/upload.service';
/**
 * Service for working with dms objects: create them, delete, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class DmsService {
  /**
   * @ignore
   */
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
   *
   * @returns Array of IDs of the objects that have been created
   */
  createDmsObject(objectTypeId: string, indexdata: any, files: File[], label?: string, silent = false): Observable<string[]> {
    const url = `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/create`;
    const data = indexdata;
    data[BaseObjectTypeField.OBJECT_TYPE_ID] = objectTypeId;

    const upload = files.length ? this.uploadService.uploadMultipart(url, files, data, label, silent) : this.uploadService.createDocument(url, data);

    return upload.pipe(
      map((res) => res.map((r: any) => r.properties[BaseObjectTypeField.OBJECT_ID].value)),
      // TODO: Replace by proper solution
      // Right now there is a gap between when the object was
      // created and when it is indexed. So delaying here will
      // give backend time to get its stuff together.
      delay(1000)
    );
  }

  /**
   * Delete a dms object.
   * @param id ID of the object to be deleted
   */
  deleteDmsObject(id: string): Observable<any> {
    const url = `/dms/objects/${id}`;
    return this.backend.delete(url, ApiBase.apiWeb);
  }

  /**
   * Upload (add/replace) content to a dms object.
   * @param objectId ID of the dms object to upload the file to
   * @param file The file to be uploaded
   */
  uploadContent(objectId: string, file: File): Observable<any> {
    return this.uploadService.upload(this.getContentPath(objectId), file).pipe(
      tap(() => {
        this.getDmsObject(objectId).subscribe((_dmsObject: DmsObject) => this.eventService.trigger(YuvEventType.DMS_OBJECT_UPDATED, _dmsObject));
      })
    );
  }

  /**
   * Path of dms object content file.
   * @param objectId ID of the dms object
   */
  getContentPath(objectId: string) {
    return `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/objects/${objectId}/contents/file`;
  }

  /**
   * Fetch a dms object.
   * @param id ID of the object to be retrieved
   * @param version Desired version of the object
   * @param intent
   */
  getDmsObject(id: string, version?: number, intent?: string): Observable<DmsObject> {
    return this.backend.get(`/dms/objects/${id}${version ? '/versions/' + version : ''}`).pipe(
      map((res) => {
        const item: SearchResultItem = this.searchService.toSearchResult(res).items[0];
        return this.searchResultToDmsObject(item);
      })
    );
  }

  /**
   * Updates a tag on a dms object.
   * @param id The ID of the object
   * @param tag The tag to be updated
   * @param value The tags new value
   */
  updateDmsObjectTag(id: string, tag: string, value: any): Observable<any> {
    return this.backend.post(`/dms/objects/${id}/tags/${tag}/state/${value}?overwrite=true`, {}, ApiBase.core);
  }

  /**
   * Update indexdata of a dms object.
   * @param id ID of the object to apply the data to
   * @param data Indexdata to be applied
   * @param silent (optional) If true, no DMS_OBJECT_UPDATED event will be send
   */
  updateDmsObject(id: string, data: any, silent?: boolean) {
    return this.backend.patch(`/dms/objects/${id}`, data).pipe(
      // update does not return permissions, so we need to re-load the whole dms object
      // TODO: Remove once permissions are provided
      switchMap((res) => this.getDmsObject(id)),
      // TODO: enable once permissions are provided
      // map((res) => this.searchResultToDmsObject(this.searchService.toSearchResult(res).items[0])),
      tap((_dmsObject: DmsObject) => {
        if (!silent) {
          this.eventService.trigger(YuvEventType.DMS_OBJECT_UPDATED, _dmsObject);
        }
      })
    );
  }

  /**
   * Moves given objects to a different context folder.
   * @param folderId the id of the new context folder of the objects
   * @param ids the ids of objects to move
   */
  moveDmsObjects(targetFolderId: string, objects: DmsObject[]) {
    let data = {};
    data[BaseObjectTypeField.PARENT_ID] = targetFolderId;
    return forkJoin(
      objects.map((o) => {
        return this.updateDmsObject(o.id, data, true).pipe(
          catchError((err) => of({ isError: true, dmsObject: o })),
          map((res) => (res instanceof DmsObject ? { isError: false, dmsObject: res } : res))
        );
      })
    ).pipe(
      map((results) => {
        let succeeded = results.filter((res) => !res.isError).map((res) => res.dmsObject);
        let failed = results.filter((res) => res.isError).map((res) => res.dmsObject);
        return { succeeded, failed, targetFolderId };
      }),
      tap((results) => this.eventService.trigger(YuvEventType.DMS_OBJECTS_MOVED, results))
    );
  }

  /**
   * Get a bunch of dms objects.
   * @param ids List of IDs of objects to be retrieved
   */
  getDmsObjects(ids: string[]): Observable<DmsObject[]> {
    return forkJoin(ids.map((id) => this.getDmsObject(id)));
  }

  /**
   * Fetch a dms object versions.
   * @param id ID of the object to be retrieved
   */
  getDmsObjectVersions(id: string): Observable<DmsObject[]> {
    return this.backend.get('/dms/objects/' + id + '/versions').pipe(
      map((res) => {
        const items: SearchResultItem[] = this.searchService.toSearchResult(res).items || [];
        return items.map((item) => this.searchResultToDmsObject(item));
      }),
      map((res) => res.sort(Utils.sortValues('version')))
    );
  }

  private searchResultToDmsObject(resItem: SearchResultItem): DmsObject {
    return new DmsObject(resItem, this.systemService.getObjectType(resItem.objectTypeId));
  }
}
