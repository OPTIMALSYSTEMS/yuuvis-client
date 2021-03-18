import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { Catalog } from './catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private catalogCache: { [key: string]: Catalog } = {};

  constructor(private backend: BackendService) {}

  getCatalog(name: string, namespace?: string): Observable<Catalog> {
    const k = `${namespace ? `${namespace}:` : ''}${name}`;
    return this.catalogCache[k]
      ? of(this.catalogCache[k])
      : this.backend.get(`/dms/catalogs/${name}${namespace ? `?appschemaname=${namespace}` : ''}`).pipe(tap((res) => (this.catalogCache[k] = res)));
  }
}
