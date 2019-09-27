import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ObjectType } from '../../model/object-type.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { Utils } from './../../util/utils';
import { SchemaResponse, SchemaResponseFieldDefinition, SchemaResponseTypeDefinition, SystemDefinition } from './system.interface';

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

  getBaseDocumentType(): ObjectType {
    return this.getObjectType('enaio:document');
  }

  getBaseFolderType(): ObjectType {
    return this.getObjectType('enaio:folder');
  }

  getLocalizedResource(key: string): string {
    return this.system.i18n[key];
  }

  /**
   * Get the form model of an object type.
   *
   * @param objectTypeId ID of the object type to fetch the form for
   * @param situation The form situation to be fetched
   * @param mode Form mode to fetch (e.g. CONTEXT)
   */
  getObjectTypeForm(objectTypeId: string, situation: string, mode?: string): Observable<any> {
    return this.backend.get(
      Utils.buildUri(`/dms/form/${objectTypeId}`, {
        situation: situation
      })
    );
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
      return new ObjectType({
        id: ot.id,
        localNamespace: ot.localNamespace,
        description: ot.description,
        baseId: ot.baseId,
        creatable: ot.creatable,
        contentStreamAllowed: ot.contentStreamAllowed,
        isFolder: ot.baseId === 'folder',
        fields: ot.fields.map((otf: SchemaResponseFieldDefinition) => ({
          id: otf.id,
          propertyType: otf.propertyType,
          description: otf.description,
          cardinality: otf.cardinality,
          required: otf.required,
          updatability: otf.updatability
        }))
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

  // private setSchemaX(schemaResponse: SchemaResponse, localizedResource: any) {
  //   // create map from properties acces them in a more performant way
  //   const propertiesMap = new Map<string, SchemaResponsePropertyDefinition>();
  //   schemaResponse.propertyDefinition.forEach(
  //     (pd: SchemaResponsePropertyDefinition) => {
  //       propertiesMap.set(pd.id, pd);
  //     }
  //   );

  //   const secondaryObjectTypes: Map<string, ObjectType> = new Map<
  //     string,
  //     ObjectType
  //   >();
  //   schemaResponse.typeSecondaryDefinition.forEach(
  //     (td: SchemaResponseTypeDefinition) => {
  //       secondaryObjectTypes.set(
  //         td.id,
  //         new ObjectType({
  //           id: td.id,
  //           baseId: td.baseId,
  //           creatable: td.creatable,
  //           description: td.description,
  //           localNamespace: td.localNamespace,
  //           isFolder: false,
  //           fields: td.propertyReference.map(pr => propertiesMap.get(pr.value))
  //         })
  //       );
  //     }
  //   );

  //   // create object types
  //   const documentTypes: ObjectType[] = schemaResponse.typeDocumentDefinition.map(
  //     (td: SchemaResponseTypeDefinition) =>
  //       this.createObjectType(td, false, propertiesMap, secondaryObjectTypes)
  //   );

  //   const folderTypes: ObjectType[] = schemaResponse.typeFolderDefinition.map(
  //     (td: SchemaResponseTypeDefinition) =>
  //       this.createObjectType(td, true, propertiesMap, secondaryObjectTypes)
  //   );

  //   const typeSecondaryDef = schemaResponse.typeSecondaryDefinition.find(
  //     td => td.id === this.BASE_TYPE_ID
  //   );
  //   if (typeSecondaryDef) {
  //     const baseType: ObjectType = new ObjectType({
  //       id: typeSecondaryDef.id,
  //       baseId: typeSecondaryDef.baseId,
  //       creatable: typeSecondaryDef.creatable,
  //       description: typeSecondaryDef.description,
  //       localNamespace: typeSecondaryDef.localNamespace,
  //       isFolder: false,
  //       fields: typeSecondaryDef.propertyReference.map(pr =>
  //         propertiesMap.get(pr.value)
  //       )
  //     });

  //     this.system = {
  //       version: schemaResponse.version,
  //       lastModificationDate: schemaResponse.lastModificationDate,
  //       objectTypes: [...documentTypes, ...folderTypes],
  //       baseType: baseType,
  //       i18n: localizedResource
  //     };
  //     this.appCache.setItem(this.STORAGE_KEY, this.system).subscribe();
  //     this.systemSource.next(this.system);
  //   } else {
  //     this.logger.error(
  //       `Schema definition does not support required secondary object type '${
  //         this.BASE_TYPE_ID
  //       }'.`
  //     );
  //   }
  // }

  // private createObjectType(
  //   schemaResType: SchemaResponseTypeDefinition,
  //   isFolder: boolean,
  //   propertiesMap: Map<string, SchemaResponsePropertyDefinition>,
  //   secondaryObjectTypes: Map<string, ObjectType>
  // ): ObjectType {
  //   // also add the fields of all secondary object types
  //   let fields: ObjectTypeField[] = schemaResType.propertyReference.map(pr =>
  //     propertiesMap.get(pr.value)
  //   );
  //   if (
  //     schemaResType.secondaryObjectTypeId &&
  //     schemaResType.secondaryObjectTypeId.length
  //   ) {
  //     schemaResType.secondaryObjectTypeId.forEach(id => {
  //       fields.push(...secondaryObjectTypes.get(id).fields);
  //     });
  //   }

  //   // add contentstream related fields as well
  //   [].forEach(f => {
  //     fields.push({
  //       id: f,
  //       cardinality: 'single',
  //       description: '',
  //       required: false,
  //       propertyType: '',
  //       updatability: ''
  //     });
  //   });

  //   return new ObjectType({
  //     id: schemaResType.id,
  //     baseId: schemaResType.baseId,
  //     creatable: schemaResType.creatable,
  //     contentStreamAllowed: schemaResType.contentStreamAllowed,
  //     description: schemaResType.description,
  //     localNamespace: schemaResType.localNamespace,
  //     isFolder: isFolder,
  //     fields: fields
  //   });
  // }

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
