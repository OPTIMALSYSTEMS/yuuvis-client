import { Injectable } from '@angular/core';
import { ApiBase, BackendService, SearchQueryProperties } from '@yuuvis/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(private backend: BackendService) {}

  exportSearchResult(searchquery: SearchQueryProperties, title: string): Observable<String> {
    return this.backend
      .post('/dms/objects/export', searchquery, ApiBase.apiWeb, { responseType: 'text' })
      .pipe(tap((csv: any) => saveAs(new Blob([csv], { type: 'text/plain;charset=utf-8' }), `${title}`)));
  }
}
