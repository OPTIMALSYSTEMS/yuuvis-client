import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ObjectType } from '../../model/object-type.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { Utils } from './../../util/utils';
import { SecondaryObjectTypeField, SystemType } from './system.enum';
import { ObjectTypeField, SchemaResponse, SchemaResponseTypeDefinition, SystemDefinition } from './system.interface';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private BASE_TYPE_ID = 'clientdefaults';
  private STORAGE_KEY = 'yuv.core.system.definition';

  private system: SystemDefinition;
  private systemSource = new ReplaySubject<SystemDefinition>();
  public system$: Observable<SystemDefinition> = this.systemSource.asObservable();

  constructor(private backend: BackendService, private appCache: AppCacheService, private logger: Logger) {}

  getObjectTypes(): ObjectType[] {
    return this.system.objectTypes;
  }

  getObjectType(objectTypeId: string): ObjectType {
    return this.system.objectTypes.find(ot => ot.id === objectTypeId);
  }

  getObjectTypeIcon(objectTypeId: string): string {
    const type = this.getObjectType(objectTypeId);
    // TODO: point to actual icon URI
    return type.isFolder
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
  }

  getBaseDocumentType(): ObjectType {
    return this.getObjectType(SystemType.DOCUMENT);
  }

  getBaseType(): ObjectType {
    const sysDocument = this.getObjectType(SystemType.DOCUMENT);
    // TODO: get fields for SecondaryObjectTypeField from schema
    const props: ObjectTypeField = { id: '', propertyType: 'string', description: '', cardinality: 'single', required: true, updatability: 'readwrite' };
    const secondaryFields: ObjectTypeField[] = [
      { ...props, id: SecondaryObjectTypeField.TITLE },
      { ...props, id: SecondaryObjectTypeField.DESCRIPTION }
    ];
    return { ...sysDocument, fields: [...sysDocument.fields, ...secondaryFields] };
  }

  getBaseFolderType(): ObjectType {
    return this.getObjectType(SystemType.FOLDER);
  }

  getLocalizedResource(key: string): string {
    const v = this.system.i18n[key];
    if (!v) {
      this.logger.error(`No translation for '${key}'`);
    }
    return v;
  }

  /**
   * Get the form model of an object type.
   *
   * @param objectTypeId ID of the object type to fetch the form for
   * @param situation The form situation to be fetched
   * @param mode Form mode to fetch (e.g. CONTEXT)
   */
  getObjectTypeForm(objectTypeId: string, situation: string, mode?: string): Observable<any> {
    return this.backend.get(Utils.buildUri(`/dms/form/${objectTypeId}`, { situation }));
  }

  isDateFormat(data: string): boolean {
    return !!JSON.stringify(data).match(/\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z\b/);
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

  /**
   * Actually fetch the system definition from the backend.
   * @param user User to fetch definition for
   */
  private fetchSystemDefinition(): Observable<boolean> {
    const fetchTasks = [this.backend.get('/dms/schema', ApiBase.core), this.fetchLocalizations()];

    return forkJoin(fetchTasks).pipe(
      catchError(error => {
        this.logger.error('Error fetching recent version of system definition from server.', error);
        this.systemSource.error('Error fetching recent version of system definition from server.');
        return of(null);
      }),
      map(data => {
        if (data && data.length) {
          this.setSchema(data[0], data[1]);
        }
        return !!data;
      })
    );
  }

  /**
   * Create the schema from the servers schema response
   * @param schemaResponse Response from the backend
   */
  private setSchema(schemaResponse: SchemaResponse, localizedResource: any) {
    const objectTypes: ObjectType[] = schemaResponse.objectTypes.map((ot: SchemaResponseTypeDefinition) => {
      const isFolder = ot.baseId === 'folder';
      return new ObjectType({
        id: ot.id,
        localNamespace: ot.localNamespace,
        description: ot.description,
        baseId: ot.baseId,
        creatable: ot.creatable,
        contentStreamAllowed: isFolder ? 'notallowed' : ot.contentStreamAllowed,
        isFolder: isFolder,
        fields: ot.fields
      });
    });

    this.system = {
      version: schemaResponse.version,
      lastModificationDate: schemaResponse.lastModificationDate,
      objectTypes,
      i18n: localizedResource
    };
    this.appCache.setItem(this.STORAGE_KEY, this.system).subscribe();
    this.systemSource.next(this.system);
  }

  toFormElement(field: ObjectTypeField): any {
    return { ...field, label: this.getLocalizedResource(`${field.id}_label`), name: field.id, type: field.propertyType };
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
