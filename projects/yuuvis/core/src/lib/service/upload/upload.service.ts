import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Utils } from '../../util/utils';

export interface ProgressStatus {
  items: ProgressStatusItem[];
  err: number;
}
export interface ProgressStatusItem {
  id: string;
  filename: string;
  progress: Observable<number>;
  subscription: Subscription;
  err?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private status: ProgressStatus = { err: 0, items: [] };
  private statusSource = new ReplaySubject<ProgressStatus>();
  public status$: Observable<ProgressStatus> = this.statusSource.asObservable();

  constructor(private http: HttpClient) {}

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

  upload(url: string, file: File): Observable<any> {
    return this.executeUpload(url, file);
  }

  uploadMultipart(url: string, file: File, data: any): Observable<any> {
    return this.executeUpload(url, file, { key: 'data', data: data });
  }

  /**
   * Upload a file ...
   * @param url
   * @param file
   * @param payload
   */
  private executeUpload(url: string, file: File, payload?: { key: string; data: string }): Observable<any> {
    const id = Utils.uuid();

    let request;
    if (payload) {
      // multipart request
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);
      formData.append(payload.key, payload.data);

      request = new HttpRequest('POST', url, formData, {
        reportProgress: true
      });
    } else {
      // regular post request
      request = new HttpRequest('POST', url, file, {
        reportProgress: true
      });
    }

    const progress = new Subject<number>();

    this.status.items.push();
    this.statusSource.next(this.status);

    return new Observable(o => {
      this.status.items.push({
        id,
        filename: file.name,
        progress: progress.asObservable(),
        err: null,
        subscription: this.http
          .request(request)
          .pipe(
            catchError(err => {
              const statusItem = this.status.items.find(s => s.id === id);
              statusItem.err = err.message;
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
                this.status.items = this.status.items.filter(s => s.id !== id);
                this.statusSource.next(this.status);
              }
            })
          )
          .subscribe(
            res => {
              o.next(res);
              o.complete();
            },
            err => {
              o.error(err);
              o.complete();
            }
          )
      });
      this.statusSource.next(this.status);
    });
  }
}
