import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ProgressStatus {
  [key: string]: { progress: Observable<number> };
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private status: ProgressStatus = {};
  private statusSource = new ReplaySubject<ProgressStatus>();
  public status$: Observable<ProgressStatus> = this.statusSource.asObservable();

  constructor(private http: HttpClient) {}

  public upload(url: string, file: File, payload?: { key: string; data: string }): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    if (payload) {
      formData.append(payload.key, payload.data);
    }

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true
    });

    const progress = new Subject<number>();

    this.status[file.name] = {
      progress: progress.asObservable()
    };
    this.statusSource.next(this.status);

    return this.http.request(req).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          progress.complete();
          delete this.status[file.name];
          this.statusSource.next(this.status);
        }
      })
    );
  }
}
