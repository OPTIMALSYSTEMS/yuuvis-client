import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { Utils } from './../../util/utils';
import { BaseObjectTypeField, Classification, ContentStreamAllowed, SecondaryObjectTypeField, SystemType } from './system.enum';
import {
  ClassificationEntry,
  ObjectType,
  ObjectTypeField,
  ObjectTypeGroup,
  SchemaResponse,
  SchemaResponseTypeDefinition,
  SystemDefinition
} from './system.interface';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private STORAGE_KEY = 'yuv.core.system.definition';

  private system: SystemDefinition;
  private systemSource = new ReplaySubject<SystemDefinition>();
  public system$: Observable<SystemDefinition> = this.systemSource.asObservable();

  constructor(private backend: BackendService, private appCache: AppCacheService, private logger: Logger) {}

  /**
   * Get all object types
   * @param withLabels Whether or not to also add the types labels
   */
  getObjectTypes(withLabels?: boolean): ObjectType[] {
    return withLabels
      ? this.system.objectTypes.map((t) => ({
          ...t,
          label: this.getLocalizedResource(`${t.id}_label`)
        }))
      : this.system.objectTypes;
  }

  /**
   * Returns grouped object types sorted by label and folders first.
   * @param withLabels Whether or not to also add the types labels
   * @param skipAbstract Whether or not to exclude abstract object types like e.g. 'system:document'
   */
  getGroupedObjectTypes(withLabels?: boolean, skipAbstract?: boolean): ObjectTypeGroup[] {
    // TODO: Apply a different property to group once grouping is available
    const grouped = this.groupBy(
      this.getObjectTypes(withLabels)
        .filter((ot) => !skipAbstract || ot.creatable)
        .map((ot) => ({
          ...ot,
          group: this.getLocalizedResource(`${ot.id}_description`)
        }))
        .sort(Utils.sortValues('label'))
        .sort((x, y) => {
          return x.isFolder === y.isFolder ? 0 : x.isFolder ? -1 : 1;
        }),
      'group'
    );

    const groups: ObjectTypeGroup[] = [];
    Object.keys(grouped)
      .sort()
      .forEach((k) => {
        delete grouped[k].group;
        groups.push({
          label: k,
          types: grouped[k]
        });
      });
    return groups;
  }

  private groupBy(arr: any[], key: string) {
    return arr.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  /**
   * Get a particular object type
   * @param objectTypeId ID of the object type
   * @param withLabel Whether or not to also add the types label
   */
  getObjectType(objectTypeId: string, withLabel?: boolean): ObjectType {
    let objectType: ObjectType = this.system.objectTypes.find((ot) => ot.id === objectTypeId);
    if (objectType && withLabel) {
      objectType.label = this.getLocalizedResource(`${objectType.id}_label`);
    }
    return objectType;
  }

  /**
   * Get the base document type all documents belong to
   * @param withLabel Whether or not to also add the types label
   */
  getBaseDocumentType(withLabel?: boolean): ObjectType {
    return this.getObjectType(SystemType.DOCUMENT, withLabel);
  }

  /**
   * Get the base folder type all folders belong to
   * @param withLabel Whether or not to also add the types label
   */
  getBaseFolderType(withLabel?: boolean): ObjectType {
    return this.getObjectType(SystemType.FOLDER, withLabel);
  }

  /**
   * Get the base object type all dms objects belong to
   */
  getBaseType(): ObjectType {
    const sysFolder = this.getBaseFolderType();
    const sysDocument = this.getBaseDocumentType();

    // base type contains only fields that are shared by base document and base folder ...
    const folderTypeFieldIDs = sysFolder.fields.map((f) => f.id);
    const baseTypeFields: ObjectTypeField[] = sysDocument.fields.filter((f) => folderTypeFieldIDs.includes(f.id));

    // ... and some secondary object type fields
    // TODO: get fields for SecondaryObjectTypeField from schema
    const props: ObjectTypeField = { id: '', propertyType: 'string', description: '', cardinality: 'single', required: true, updatability: 'readwrite' };
    const secondaryFields: ObjectTypeField[] = [
      { ...props, id: SecondaryObjectTypeField.TITLE },
      { ...props, id: SecondaryObjectTypeField.DESCRIPTION }
    ];
    return {
      id: SystemType.OBJECT,
      localNamespace: null,
      description: null,
      baseId: null,
      creatable: false,
      isFolder: false,
      fields: [...baseTypeFields, ...secondaryFields]
    };
  }

  /**
   * Get the icon for an object type. This will return an SVG as a string.
   * @param objectTypeId ID of the object type
   */
  getObjectTypeIcon(objectTypeId: string): string {
    if (objectTypeId) {
      const type = this.getObjectType(objectTypeId);
      // TODO: point to actual icon URI
      return type && type.isFolder
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
    } else {
      return null;
    }
  }

  /**
   * Retrieve an organization object by its ID
   * @param id ID of org object
   */
  getOrganizationObjectById(id: string): Observable<any> {
    return of('1');
    // return this.backend.get(`/organization/id/${id}`)
  }

  getLocalizedResource(key: string): string {
    const v = this.system.i18n[key];
    if (!v) {
      this.logger.warn(`No translation for '${key}'`);
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
      catchError((error) => {
        this.logger.error('Error fetching recent version of system definition from server.', error);
        this.systemSource.error('Error fetching recent version of system definition from server.');
        return of(null);
      }),
      map((data) => {
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

      // map certain fields to organization type (fake it until you make it ;-)
      const orgTypeFields = [BaseObjectTypeField.MODIFIED_BY, BaseObjectTypeField.CREATED_BY];
      ot.fields.forEach((f) => {
        if (orgTypeFields.includes(f.id)) {
          f.classification = [Classification.STRING_ORGANIZATION];
        }
      });
      return {
        id: ot.id,
        localNamespace: ot.localNamespace,
        description: ot.description,
        baseId: ot.baseId,
        creatable: ot.creatable,
        contentStreamAllowed: isFolder ? ContentStreamAllowed.NOT_ALLOWED : ot.contentStreamAllowed,
        isFolder: isFolder,
        fields: ot.fields
      };
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

  /**
   * Extract classifications from object type fields classification
   * string. This string may contain more than one classification entry.
   *
   * Classification is a comma separated string that may contain additional
   * properties related to on classification entry. Example:
   *
   * `id:reference[system:folder], email`
   *
   * @param classifications Object type fields classification property (schema)
   */
  getClassifications(classifications: string[]): Map<string, ClassificationEntry> {
    const res = new Map<string, ClassificationEntry>();
    if (classifications) {
      classifications.forEach((c) => {
        const matches: string[] = c.match(/^([^\[]*)(\[(.*)\])?$/);
        res.set(matches[1], {
          classification: matches[1],
          options: matches[3] ? matches[3].split(',') : []
        });
      });
    }
    return res;
  }

  toFormElement(field: ObjectTypeField): any {
    return { ...field, label: this.getLocalizedResource(`${field.id}_label`), name: field.id, type: field.propertyType };
  }

  updateLocalizations(): Observable<any> {
    return this.fetchLocalizations().pipe(
      tap((res) => {
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
