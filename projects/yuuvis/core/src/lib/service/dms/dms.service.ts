import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
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

  // general trigger operator to handle all dms events
  private triggerEvent(event: YuvEventType, id?: string, silent = false) {
    return (stream): Observable<any> =>
      stream.pipe(
        // update does not return permissions, so we need to re-load the whole dms object
        // TODO: Remove once permissions are provided
        switchMap((res) => (!id ? of(res) : this.getDmsObject(id))),
        // TODO: enable once permissions are provided
        // map((res) => this.searchResultToDmsObject(this.searchService.toSearchResult(res).items[0])),
        tap((res: any) => !silent && this.eventService.trigger(event, res))
      );
  }

  // general trigger operator to handle all dms events
  private triggerEvents(event: YuvEventType, ids?: string[], silent = false) {
    return (stream): Observable<any> =>
      stream.pipe(
        // update does not return permissions, so we need to re-load the whole dms object
        // TODO: Remove once permissions are provided
        switchMap((res) => (!ids ? of(res) : this.getDmsObjects(ids))),
        // TODO: enable once permissions are provided
        // map((_res: any[]) => _res.map((res, i) => res?._error ? { ...res, id: ids?[i] } : this.searchResultToDmsObject(this.searchService.toSearchResult(res).items[0]))),
        map((_res: any[]) => _res.map((res, i) => (res?._error && ids ? { ...res, id: ids[i] } : res))),
        tap((res: any) => !silent && res.forEach((o) => o && this.eventService.trigger(event, o)))
      );
  }

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
    const url = `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/objects`;
    const data = indexdata;
    data[BaseObjectTypeField.OBJECT_TYPE_ID] = objectTypeId;

    const upload = files.length ? this.uploadService.uploadMultipart(url, files, data, label, silent) : this.uploadService.createDocument(url, data);

    return upload
      .pipe(
        map((res) => res.map((r: any) => r.properties[BaseObjectTypeField.OBJECT_ID].value)),
        // TODO: Replace by proper solution
        // Right now there is a gap between when the object was
        // created and when it is indexed. So delaying here will
        // give backend time to get its stuff together.
        delay(1000)
      )
      .pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_CREATED, '', silent));
  }

  /**
   * Delete a dms object.
   * @param id ID of the object to be deleted
   */
  deleteDmsObject(id: string, silent = false): Observable<any> {
    const url = `/dms/objects/${id}`;
    return this.backend
      .delete(url, ApiBase.apiWeb)
      .pipe(map(() => ({ id })))
      .pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_DELETED, '', silent));
  }

  /**
   * Upload (add/replace) content to a dms object.
   * @param objectId ID of the dms object to upload the file to
   * @param file The file to be uploaded
   */
  uploadContent(objectId: string, file: File): Observable<any> {
    return this.uploadService.upload(this.getContentPath(objectId), file).pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_UPDATED, objectId));
  }

  /**
   * Path of dms object content file.
   * @param objectId ID of the dms object
   */
  getContentPath(objectId: string) {
    return `${this.backend.getApiBase(ApiBase.apiWeb)}/dms/objects/${objectId}/contents/file`;
  }

  /**
   * Downloads the content of dms objects.
   *
   * @param DmsObject[] dmsObjects Array of dms objects to be downloaded
   * @param withVersion should download specific version of the object
   */
  downloadContent(objects: DmsObject[], withVersion?: boolean) {
    objects.forEach((object) => {
      const uri = `${this.getContentPath(object?.id)}${withVersion ? '?version=' + object.version : ''}`;
      this.backend.download(uri);
    });
  }

  /**
   * Fetch a dms object.
   * @param id ID of the object to be retrieved
   * @param version Desired version of the object
   */
  getDmsObject(id: string, version?: number, silent = false): Observable<DmsObject> {
    return this.backend
      .get(`/dms/objects/${id}${version ? '/versions/' + version : ''}`)
      .pipe(
        map((res) => {
          const item: SearchResultItem = this.searchService.toSearchResult(res).items[0];
          return this.searchResultToDmsObject(item);
        })
      )
      .pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_LOADED, '', silent));
  }

  /**
   * Updates a tag on a dms object.
   * @param id The ID of the object
   * @param tag The tag to be updated
   * @param value The tags new value
   */
  setDmsObjectTag(id: string, tag: string, value: any, silent = false): Observable<any> {
    return this.backend
      .post(`/dms/objects/tags/${tag}/state/${value}?query=SELECT * FROM system:object WHERE system:objectId='${id}'`, {}, ApiBase.core)
      .pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_UPDATED, id, silent));
  }

  /**
   * Update indexdata of a dms object.
   * @param id ID of the object to apply the data to
   * @param data Indexdata to be applied
   * @param silent flag to trigger DMS_OBJECT_UPDATED event
   */
  updateDmsObject(id: string, data: any, silent = false) {
    return this.backend.patch(`/dms/objects/${id}`, data).pipe(this.triggerEvent(YuvEventType.DMS_OBJECT_UPDATED, id, silent));
  }

  /**
   * Updates given objects.
   * @param objects the objects to updated
   */
  updateDmsObjects(objects: Partial<DmsObject>[], silent = false) {
    const ids = objects.map((o) => o.id);
    return this.batchUpdate(objects).pipe(this.triggerEvents(YuvEventType.DMS_OBJECT_UPDATED, ids, silent));
  }

  /**
   * Updates a tag on a dms object.
   * @param ids List of IDs of objects
   * @param tag The tag to be updated
   * @param value The tags new value
   */
  updateDmsObjectsTag(ids: string[], tag: string, value: any, silent = false): Observable<any> {
    return this.batchUpdateTag(ids, tag, value).pipe(this.triggerEvents(YuvEventType.DMS_OBJECT_UPDATED, ids, silent));
  }

  /**
   * Moves given objects to a different context folder.
   * @param folderId the id of the new context folder of the objects
   * @param ids the ids of objects to move
   */
  moveDmsObjects(targetFolderId: string, objects: DmsObject[], silent = false) {
    const data = { [BaseObjectTypeField.PARENT_ID]: targetFolderId };
    return this.batchUpdate(objects.map((o) => ({ ...o, ...data }))).pipe(
      map((results: any[]) => {
        let succeeded = results.filter((res) => !res?._error).map((res) => objects.find((o) => o.id === res.id));
        let failed = results.filter((res) => res?._error).map((res) => objects.find((o) => o.id === res.id));
        succeeded.forEach((s) => Object.assign(s, data));
        return { succeeded, failed, targetFolderId };
      }),
      tap((res) => !silent && this.eventService.trigger(YuvEventType.DMS_OBJECTS_MOVED, res.succeeded))
    );
  }

  /**
   * Get a bunch of dms objects.
   * @param ids List of IDs of objects to be retrieved
   */
  getDmsObjects(ids: string[], silent = false): Observable<DmsObject[]> {
    return this.batchGet(ids)
      .pipe(
        map((_res: any[]) =>
          _res.map((res, i) => (res?._error ? { ...res, id: ids[i] } : this.searchResultToDmsObject(this.searchService.toSearchResult(res).items[0])))
        )
      )
      .pipe(this.triggerEvents(YuvEventType.DMS_OBJECT_LOADED, null, silent));
  }

  /**
   * Delete a bunch of dms objects.
   * @param ids List of IDs of objects to be deleted
   */
  deleteDmsObjects(ids: string[], silent = false): Observable<string[]> {
    return this.batchDelete(ids)
      .pipe(map((_res: any[]) => _res.map((res, i) => (res?._error ? { ...res, id: ids[i] } : ids[i]))))
      .pipe(this.triggerEvents(YuvEventType.DMS_OBJECT_DELETED, null, silent));
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

  private getBatchBody(o: any) {
    const m = { ...o };
    delete m.id;
    return m;
  }

  batchUpdateTag(ids: string[], tag: string, value: any) {
    return this.backend.batch(
      ids.map((id) => ({
        method: 'POST',
        uri: `/dms/objects/tags/${tag}/state/${value}?query=SELECT * FROM system:object WHERE system:objectId='${id}'`,
        base: ApiBase.core,
        body: {}
      }))
    );
  }

  batchUpdate(objects: Partial<DmsObject>[]) {
    return this.backend.batch(objects.map((o) => ({ method: 'PATCH', uri: `/dms/objects/${o.id}`, body: this.getBatchBody(o) })));
  }

  batchDelete(ids: string[]) {
    return this.backend.batch(ids.map((id) => ({ method: 'DELETE', uri: `/dms/objects/${id}` })));
  }

  batchGet(ids: string[]) {
    return this.backend.batch(ids.map((id) => ({ method: 'GET', uri: `/dms/objects/${id}` })));
  }
}
