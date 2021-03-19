import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { Catalog } from './catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private catalogCache: { [key: string]: Catalog } = {};

  constructor(private backend: BackendService) {}

  /**
   * Loads a catalog from the backend.
   * @param name The catalogs name
   * @param namespace Optional namespace
   */
  getCatalog(name: string, namespace?: string): Observable<Catalog> {
    const k = this.cacheKey(name, namespace);
    return this.catalogCache[k]
      ? of(this.catalogCache[k])
      : this.backend.get(this.getUri(name, namespace)).pipe(
          map((res) => ({
            name: name,
            namespace: namespace,
            entries: res.entries
          })),
          tap((catalog: Catalog) => (this.catalogCache[k] = catalog))
        );
  }

  /**
   * Updates an existing catalog.
   * @param name The catalogs name
   * @param patches A collection of JSON-Pathes. See http://jsonpatch.com/ for details
   * @param namespace Optional namespace
   */
  patch(name: string, patches: any[], namespace?: string): Observable<Catalog> {
    this.backend.setHeader('Content-Type', 'application/json-patch+json');
    return this.backend.patch(this.getUri(name, namespace), patches).pipe(
      map((res) => ({
        name: name,
        namespace: namespace,
        entries: res.entries
      })),
      tap((catalog: Catalog) => {
        this.backend.setHeader('Content-Type', 'application/json');
        this.updateCache(catalog);
      })
    );
  }

  /**
   * Create a new catalog.
   * @param catalog The catalog to be created (saved on the backend side)
   */
  create(catalog: Catalog) {
    return this.backend.post(this.getUri(catalog.name, catalog.namespace)).pipe(tap((res) => this.updateCache(catalog)));
  }

  private getUri(name: string, namespace?: string): string {
    return `/dms/catalogs/${name}${namespace ? `?appschemaname=${namespace}` : ''}`;
  }

  private updateCache(catalog: Catalog) {
    this.catalogCache[this.cacheKey(catalog.name, catalog.namespace)] = catalog;
  }

  private cacheKey(name: string, namespace?: string) {
    return `${namespace ? `${namespace}:` : ''}${name}`;
  }
}
