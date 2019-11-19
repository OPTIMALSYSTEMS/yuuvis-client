import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, scan, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { Logger } from '../logger/logger';
import { BaseObjectTypeField, SecondaryObjectTypeField } from '../system/system.enum';
import { ProgressStatus } from './upload.interface';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private status: ProgressStatus = { err: 0, items: [] };
  private statusSource = new ReplaySubject<ProgressStatus>();
  public status$: Observable<ProgressStatus> = this.statusSource.pipe(scan((acc, newVal) => ({ ...acc, ...newVal }), this.status));

  constructor(private http: HttpClient, private logger: Logger) {}

  /**
   * Upload a file.
   * @param url The URL to upload the file to
   * @param file The file to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  upload(url: string, file: File, label?: string): Observable<any> {
    return this.executeUpload(url, file, label || file.name);
  }

  /**
   * Upload files using multipart upload.
   * @param url The URL to upload the files to
   * @param files The files to be uploaded
   * @param data Data to be send along with the files
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  uploadMultipart(url: string, files: File[], data?: any, label?: string): Observable<any> {
    return this.executeMultipartUpload(url, files, label || 'Upload', data);
  }

  /**
   * Cancels an upload request and removes it from the list of files being uploaded.
   * @param id ID of the UploadItem to be canceled
   */
  cancelItem(id: string) {
    const match = this.status.items.find(i => i.id === id);
    if (match) {
      match.subscription.unsubscribe();
      this.status.items = this.status.items.filter(i => i.id !== id);
      this.statusSource.next(this.status);
    }
  }

  /**
   * Prepares single file POST upload.
   * @param url The URL to upload the file to
   * @param file The file to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  private executeUpload(url: string, file: File, label: string): Observable<any> {
    const request = new HttpRequest('POST', url, file, {
      headers: new HttpHeaders({
        'Content-Disposition': `attachment; filename=${file.name}`,
        'ngsw-bypass': 'ngsw-bypass'
      }),
      reportProgress: true
    });
    return this.startUpload(request, label);
  }

  /**
   * Prepare multipart upload.
   * @param url The URL to upload the file to
   * @param file Array of files to be uploaded
   * @param label A label that will show up in the upload overlay dialog while uploading
   * @param data Data to be send along with the files
   */
  private executeMultipartUpload(url: string, file: File[], label: string, data?: any): Observable<any> {
    const formData: FormData = new FormData();
    file.forEach(f => {
      formData.append('files', f, f.name);
    });

    if (data) {
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    }

    const request = new HttpRequest('POST', url, formData, {
      headers: new HttpHeaders({
        'ngsw-bypass': 'ngsw-bypass'
      }),
      reportProgress: true
    });
    return this.startUpload(request, label);
  }

  /**
   * Actually starts the upload process.
   * @param request Request to be executed
   * @param label A label that will show up in the upload overlay dialog while uploading
   */
  private startUpload(request: any, label: string): Observable<any> {
    return new Observable(o => {
      const id = Utils.uuid();
      const progress = new Subject<number>();
      let result;
      // Create a subscription from the http request that will be applied to the upload
      // status item in order to be able to cancel the request later on.
      const subscription = this.http
        .request(request)
        .pipe(
          catchError(err => {
            const statusItem = this.status.items.find(s => s.id === id);
            statusItem.err = {
              code: err.status,
              message: err.error ? err.error.errorMessage : err.message
            };
            this.logger.error('upload failed', statusItem);
            this.status.err++;
            progress.next(0);
            return throwError(err);
          }),
          tap(event => {
            if (event.type === HttpEventType.UploadProgress) {
              const percentDone = Math.round((100 * event.loaded) / event.total);
              progress.next(percentDone);
            } else if (event instanceof HttpResponse) {
              progress.complete();
              // add upload response
              console.log('response', event);
              // this.status.items = this.status.items.filter(s => s.id !== id);
              const idx = this.status.items.findIndex(s => s.id === id);
              if (idx !== -1) {
                this.status.items[idx].result = (event.body as any).objects.map(o => ({
                  objectId: o.properties[BaseObjectTypeField.OBJECT_ID].value,
                  contentStreamId: o.contentStreams[0]['contentStreamId'],
                  filename: o.contentStreams[0]['fileName'],
                  label: o.properties[SecondaryObjectTypeField.TITLE] ? o.properties[SecondaryObjectTypeField.TITLE].value : null
                }));
                this.statusSource.next(this.status);
              }
            }
          })
        )
        // actual return value of this function
        .subscribe(
          (res: any) => {
            if (res.status) {
              result = res;
            }
          },
          err => {
            o.error(err);
            o.complete();
          },
          () => {
            o.next(result);
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
