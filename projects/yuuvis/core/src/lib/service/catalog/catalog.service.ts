import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { UserService } from '../user/user.service';
import { Catalog, CatalogEntry } from './catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor(private backend: BackendService, private userService: UserService) {}

  private userHasScopePermissions(scope: 'admin' | 'system'): boolean {
    if (scope === 'admin') {
      return this.userService.hasAdminRole;
    } else if (scope === 'system') {
      return this.userService.hasSystemRole;
    } else {
      return false;
    }
  }

  /**
   * Loads a catalog from the backend.
   * @param qname The catalogs qualified name
   * @param scope The scope to load the catalog from. This decides which controler
   * will be used to fetch the catalog. Possibe values: 'admin' or 'system'.
   * Setting a scope will also check for the users permission to use this scope.
   */
  getCatalog(qname: string, scope?: 'admin' | 'system'): Observable<Catalog> {
    const ctrl = scope && this.userHasScopePermissions(scope) ? scope : 'dms';
    return this.backend.get(`/${ctrl}/catalogs/${qname}`).pipe(
      catchError((e) => {
        if (e.status === 404) {
          return of({ entries: [] });
        } else {
          throw e;
        }
      }),
      map((res: { tenant?: string; entries: CatalogEntry[]; readonly: boolean }) => ({
        qname: qname,
        entries: res.entries,
        tenant: res.tenant,
        readonly: res.readonly
      }))
    );
  }

  /**
   * Updates an existing catalog.
   * @param name The catalogs name
   * @param patches A collection of JSON-Pathes. See http://jsonpatch.com/ for details
   * @param namespace Optional namespace
   */
  patch(qname: string, patches: any[]): Observable<Catalog> {
    this.backend.setHeader('Content-Type', 'application/json-patch+json');
    return this.backend.patch(`/dms/catalogs/${qname}`, patches).pipe(
      map((res: Catalog) => ({
        qname: qname,
        entries: res.entries,
        tenant: res.tenant
      })),
      tap((catalog: Catalog) => {
        this.backend.setHeader('Content-Type', 'application/json');
      })
    );
  }

  /**
   * Saves a whole catalog. This will overwrite the existing catalog with the entries
   * provided or create a new catalog.
   * @param catalog The catalog to be saved
   * @param scope The scope to be used. This decides which controller
   * will be used to post data to. Possibe values: 'admin' or 'system'.
   * Setting a scope will also check for the users permission to use this scope.
   */
  post(catalog: Catalog, scope?: 'admin' | 'system'): Observable<Catalog> {
    const ctrl = scope && this.userHasScopePermissions(scope) ? scope : 'dms';
    return this.backend
      .post(`/${ctrl}/catalogs/${catalog.qname}`, {
        entries: catalog.entries
      })
      .pipe(
        map(() => {
          catalog.tenant = this.userService.getCurrentUser().tenant;
          return catalog;
        })
      );
  }

  /**
   * Checks whether or not particular entries of a catalog are in use.
   * @param qname The catalogs qualified name
   * @param values The entries to be checked
   * @returns An array of entries that are in use
   */
  inUse(qname: string, values: string[]): Observable<string[]> {
    const queryParams = values.map((v) => `entries=${encodeURIComponent(v)}`);
    return this.backend.get(`/dms/catalogs/${qname}/validate?${queryParams.join('&')}`);
  }
}
