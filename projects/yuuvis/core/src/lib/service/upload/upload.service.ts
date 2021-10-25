import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, filter, map, scan, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { BackendService } from '../backend/backend.service';
import { Logger } from '../logger/logger';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField } from '../system/system.enum';
import { CreatedObject, ProgressStatus, UploadResult } from './upload.interface';

const transformResponse = () => map((res: CreatedObject) => (res && res.body ? res.body.objects.map((val) => val) : null));

/**
 * Service for providing upload of different object types into a client.
 */
@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private status: ProgressStatus = { err: 0, items: [] };
  private statusSource = new ReplaySubject<ProgressStatus>();
  public status$: Observable<ProgressStatus> = this.statusSource.pipe(scan((acc: ProgressStatus, newVal) => ({ ...acc, ...newVal }), this.status));
  private uploadStatus = new BehaviorSubject<boolean>(null);
  public uploadStatus$: Observable<boolean> = this.uploadStatus.asObservable();

  /**
   * @ignore
   */
  constructor(private backend: BackendService, private http: HttpClient, private logger: Logger) {}

  /**
   * Upload a file.
   * @param url The URL to upload the file to
   * @param file The file to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  upload(url: string, file: File, label?: string, silent?: boolean): Observable<any> {
    return this.executeUpload(url, file, label || file.name, silent);
  }

  /**
   * Upload files using multipart upload.
   * @param url The URL to upload the files to
   * @param files The files to be uploaded
   * @param data Data to be send along with the files
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  uploadMultipart(url: string, files: File[], data?: any, label?: string, silent?: boolean): Observable<any> {
    return this.executeMultipartUpload(url, files, label || 'Upload', data, silent);
  }

  createDocument(url: string, data: any): Observable<any> {
    const formData: FormData = this.createFormData({ data });
    const request = this.createHttpRequest(url, { formData }, false);
    return this.http.request(request).pipe(
      filter((obj: any) => obj && obj.body),
      transformResponse(),
      catchError((err) => throwError(err))
    );
  }

  /**
   * Cancels an upload request and removes it from the list of files being uploaded.
   * @param id ID of the UploadItem to be canceled
   */
  cancelItem(id?: string) {
    if (id) {
      const match = this.status.items.find((i) => i.id === id);
      if (match) {
        match.subscription.unsubscribe();
        this.status.items = this.status.items.filter((i) => i.id !== id);
      }
    } else {
      this.status.items.forEach((element) => element.subscription.unsubscribe());
      this.status.items = [];
    }
    this.statusSource.next(this.status);
  }

  /**
   * Prepares Formdata for multipart upload.
   * @param from contains form and or file
   */
  private createFormData({ file, data }: { data?: any; file?: File[] }): FormData {
    const formData: FormData = new FormData();
    (file || []).forEach((f) => formData.append('files', f, f.name));
    data ? formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' })) : null;
    return formData;
  }

  /**
   * Prepares Http Request.
   * @param url The URL to upload the file to
   * @param content formdata or single file
   * @param reportProgress Request should report upload progress
   * @param method Request method
   */
  private createHttpRequest(url: string, content: Partial<{ formData: FormData; file: File }>, reportProgress: boolean, method = 'POST'): HttpRequest<any> {
    const { formData, file } = content;
    // add request param to bypass the serviceworker
    url += `${url.indexOf('?') === -1 ? '?' : '&'}ngsw-bypass=1`;

    const headers: any = this.backend.getAuthHeaders();
    if (file) {
      headers['Content-Disposition'] = `attachment; filename="${file.name}"`;
    }

    return new HttpRequest(method, url, file || formData, {
      headers: new HttpHeaders(headers),
      reportProgress
    });
  }

  /**
   * Prepares single file POST upload.
   * @param url The URL to upload the file to
   * @param file The file to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  private executeUpload(url: string, file, label: string, silent = false): Observable<any> {
    const request = this.createHttpRequest(url, { file }, true);
    return silent ? this.http.request(request) : this.startUploadWithFile(request, label).pipe(transformResponse());
  }

  /**
   * Prepare multipart upload.
   * @param url The URL to upload the file to
   * @param file Array of files to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   * @param data Data to be send along with the files
   */
  private executeMultipartUpload(url: string, file: File[], label: string, data?: any, silent = false): Observable<any> {
    const formData: FormData = this.createFormData({ file, data });
    const request = this.createHttpRequest(url, { formData }, true);
    return silent ? this.http.request(request) : this.startUploadWithFile(request, label).pipe(transformResponse());
  }

  private generateResult(result: CreatedObject): UploadResult[] {
    const { objects } = result.body;
    if (objects.length > 1) {
      const data = objects[0];
      const label = data.properties[ClientDefaultsObjectTypeField.TITLE] ? data.properties[ClientDefaultsObjectTypeField.TITLE].value : '...';
      return [
        {
          objectId: objects.map((val) => val.properties[BaseObjectTypeField.OBJECT_ID].value),
          contentStreamId: data.contentStreams[0]?.contentStreamId,
          filename: data.contentStreams[0]?.fileName,
          label: `(${objects.length}) ${label}`
        }
      ];
    } else {
      return result.body.objects.map((o) => ({
        objectId: o.properties[BaseObjectTypeField.OBJECT_ID].value,
        contentStreamId: o.contentStreams[0]?.contentStreamId,
        filename: o.contentStreams[0]?.fileName,
        label: o.properties[ClientDefaultsObjectTypeField.TITLE] ? o.properties[ClientDefaultsObjectTypeField.TITLE].value : o.contentStreams[0]?.fileName
      }));
    }
  }

  private createProgressStatus(event, progress: Subject<number>, id: string) {
    if (event.type === HttpEventType.UploadProgress) {
      const percentDone = Math.round((100 * event.loaded) / event.total);
      progress.next(percentDone);
    } else if (event instanceof HttpResponse) {
      progress.complete();
      // add upload response
      // this.status.items = this.status.items.filter(s => s.id !== id);
      const idx = this.status.items.findIndex((s) => s.id === id);
      if (idx !== -1) {
        this.status.items[idx].result = this.generateResult(event);
        this.statusSource.next(this.status);
      }
    }
  }

  private createUploadError(err: HttpErrorResponse, progress: Subject<number>, id: string): Observable<HttpErrorResponse> {
    const statusItem = this.status.items.find((s) => s.id === id);
    statusItem.err = {
      code: err.status,
      message: err.error ? err.error.errorMessage : err.message
    };
    this.logger.error('upload failed', statusItem);
    this.status.err++;
    progress.next(0);
    return throwError(err);
  }

  /**
   * Actually starts the upload process.
   * @param request Request to be executed
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  private startUploadWithFile(request: any, label: string): Observable<CreatedObject> {
    return new Observable((o) => {
      const id = Utils.uuid();
      const progress = new Subject<number>();
      let result;
      // Create a subscription from the http request that will be applied to the upload
      // status item in order to be able to cancel the request later on.
      this.uploadStatus.next(false);
      const subscription = this.http
        .request(request)
        .pipe(
          catchError((err: HttpErrorResponse) => this.createUploadError(err, progress, id)),
          tap((event) => this.createProgressStatus(event, progress, id))
        )
        // actual return value of this function
        .subscribe(
          (res: any) => (res.status ? (result = res) : null),
          (err) => {
            o.error(err);
            this.uploadStatus.next(true);
            o.complete();
          },
          () => {
            o.next(result);
            this.uploadStatus.next(true);
            o.complete();
          }
        );

      this.status.items.push({
        id,
        filename: label,
        progress: progress.asObservable(),
        subscription,
        err: null
      });
      this.statusSource.next(this.status);
    });
  }
}
