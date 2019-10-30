import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BackendService } from './../backend/backend.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private status: { [key: string]: { progress: Observable<number> } } = {};
  private statusSource = new ReplaySubject<any>();
  public status$: Observable<any> = this.statusSource.asObservable();

  constructor(private http: HttpClient, private backend: BackendService) {}

  public upload(url: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

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
