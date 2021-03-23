import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { UserService } from '../user/user.service';
import { Catalog, CatalogEntry } from './catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private catalogCache: { [key: string]: Catalog } = {};

  constructor(private backend: BackendService, private userService: UserService) {}

  /**
   * Loads a catalog from the backend.
   * For regular users that do not have Admin- or System-Role, catalogs that do not have the
   * namespace of the current users tenant (example: users tenanat is 'tenAcme', catalogs namespace is 'appInvoice'):
   *
   * - the catalog will be fetched with the prefix of the current users tenant
   * (ex: namespace to fetch: 'tenAcme:appInvoice')
   * - if there is no catalog available under this prefix, the orinal catalog will be
   * loaded but set to be readonly
   *
   * @param name The catalogs name
   * @param namespace Optional namespace
   */
  getCatalog(name: string, namespace?: string): Observable<Catalog> {
    // differ between user permissions
    let readonly = false;
    const user = this.userService.getCurrentUser();
    const tenantNamespace =
      (!this.userService.hasAdminRole || !this.userService.hasSystemRole) && !namespace.startsWith(user.tenant) ? `${user.tenant}${namespace || ''}` : null;

    return (!tenantNamespace
      ? this.backend.get(this.getUri(name, namespace))
      : this.backend.get(this.getUri(name, tenantNamespace)).pipe(
          catchError((e) => {
            if (e.status === 404) {
              return of({ entries: [] });
            } else {
              throw e;
            }
          }),
          switchMap((tenantCatalog) => {
            // if tenant catalog is empty, fetch content of the root catalog
            readonly = tenantCatalog.entries.length === 0;
            return readonly ? this.backend.get(this.getUri(name, namespace)) : tenantCatalog;
          })
        )
    ).pipe(
      map((res: { entries: CatalogEntry[] }) => ({
        name: name,
        namespace: namespace,
        entries: res.entries,
        readonly: readonly
      }))
    );

    // const k = this.cacheKey(name, namespace);
    // return this.catalogCache[k]
    //   ? of(this.catalogCache[k])
    //   : this.backend.get(this.getUri(name, namespace)).pipe(
    //       map((res) => ({
    //         name: name,
    //         namespace: namespace,
    //         entries: res.entries,
    //         readonly
    //       })),
    //       tap((catalog: Catalog) => (this.catalogCache[k] = catalog))
    //     );
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

  /**
   * Checks whether or not particular entries of a catalog are in use.
   * @param catalogName The catalogs name
   * @param catalogNamespace Optional namespace
   * @param values The entries to be checked
   * @returns An array of entries that are in use
   */
  inUse(catalogName: string, values: string[], catalogNamespace?: string): Observable<string[]> {
    const queryParams = values.map((v) => `entries=${encodeURIComponent(v)}`);
    if (catalogNamespace) queryParams.push(`namespace=${encodeURIComponent(catalogNamespace)}`);
    return this.backend.get(`/dms/catalogs/${catalogName}/validate?${queryParams.join('&')}`).pipe(
      tap((res) => {
        console.log(res);
      })
    );
  }

  private getUri(name: string, namespace?: string): string {
    return `/dms/catalogs/${name}${namespace ? `?namespace=${encodeURIComponent(namespace)}` : ''}`;
  }

  private updateCache(catalog: Catalog) {
    this.catalogCache[this.cacheKey(catalog.name, catalog.namespace)] = catalog;
  }

  private cacheKey(name: string, namespace?: string) {
    return `${namespace ? `${namespace}:` : ''}${name}`;
  }
}
