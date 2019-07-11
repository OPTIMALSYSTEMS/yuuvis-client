import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ObjectType, ObjectTypeField } from '../../model/object-type.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { BASE_PARAM_FIELDS } from './baseparams.fields';
import { SystemDefinition } from './system.interface';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private STORAGE_KEY = 'yuv.core.system.definition';

  private system: SystemDefinition;
  private systemSource = new ReplaySubject<SystemDefinition>();
  public system$: Observable<
    SystemDefinition
  > = this.systemSource.asObservable();

  constructor(
    private backend: BackendService,
    private appCache: AppCacheService,
    private logger: Logger
  ) {}

  getObjectTypes(): ObjectType[] {
    return this.system.objectTypes;
  }

  getObjectType(objectTypeId: string): ObjectType {
    return this.system.objectTypes.find(ot => ot.id === objectTypeId);
  }

  getLocalizedResource(key: string): string {
    return this.system.i18n[key];
  }

  /**
   * Fetches the backends system definition and updates system$ Observable.
   * Subscribe to the system$ observable instead of calling this function, otherwise you'll trigger fetching the
   * system definition every time.
   *
   * @param user The user to load the system definition for
   */
  getSystemDefinition(): Observable<boolean> {
    // TODO: Supposed to return 304 if nothing changes
    return this.fetchSystemDefinition();

    // TODO: remove when 304 is there???
    // // try to fetch system definition from cache first
    // return this.appCache.getItem(this.STORAGE_KEY).pipe(
    //   switchMap(res => {
    //     if (res) {
    //       // check if the system definition from the cache is up to date
    //       this.system = res;
    //       this.systemSource.next(this.system);
    //       return of(true);
    //     } else {
    //       // nothing cached so far
    //       return this.fetchSystemDefinition();
    //     }
    //   })
    // );
  }

  getBaseParamsTypeFields(): ObjectTypeField[] {
    // TODO: Should return all fields from the secondary objecttype
    return BASE_PARAM_FIELDS;
  }

  /**
   * Actually fetch the system definition from the backend.
   * @param user User to fetch definition for
   */
  private fetchSystemDefinition(): Observable<boolean> {
    const fetchTasks = [
      this.backend.get('/dms/schema', ApiBase.core),
      this.fetchLocalizations()
    ];

    return forkJoin(fetchTasks).pipe(
      catchError(error => {
        this.logger.error(
          'Error fetching recent version of system definition from server.',
          error
        );
        this.systemSource.error(
          'Error fetching recent version of system definition from server.'
        );
        return of(null);
      }),
      map(data => {
        if (data && data.length) {
          // getting an array of system definitions
          // TODO: support multiple system definitions???
          const sysDef = data[0];
          this.system = {
            version: sysDef.version,
            lastModificationDate: sysDef.lastModificationDate,
            objectTypes: sysDef.objectTypes.map(ot => new ObjectType(ot)),
            i18n: data[1]
          };
          this.appCache.setItem(this.STORAGE_KEY, this.system).subscribe();
          this.systemSource.next(this.system);
        }
        return !!data;
      })
    );
  }

  updateLocalizations(): Observable<any> {
    return this.fetchLocalizations().pipe(
      tap(res => {
        this.system.i18n = res;
        this.appCache.setItem(this.STORAGE_KEY, this.system).subscribe();
        this.systemSource.next(this.system);
      })
    );
  }

  private fetchLocalizations(): Observable<any> {
    return this.backend.get('/resources/text');
  }
}
