import { Injectable } from '@angular/core';
import { BackendService, SearchQuery } from '@yuuvis/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(private backend: BackendService) {}

  exportSearchResult(searchquery: SearchQuery, title: string): Observable<String> {
    return this.backend
      .post('/api-web/api/dms/objects/export', searchquery, null, { responseType: 'text' })
      .pipe(tap((csv: any) => saveAs(new Blob([csv], { type: 'text/plain;charset=utf-8' }), `${title}`)));
  }
}
