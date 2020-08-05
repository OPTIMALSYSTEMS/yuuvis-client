import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { Utils } from './../../util/utils';
import { Classification, ContentStreamAllowed, InternalFieldType, ObjectTypeClassification, SecondaryObjectTypeField, SystemType } from './system.enum';
import {
  ClassificationEntry,
  ObjectType,
  ObjectTypeField,
  ObjectTypeGroup,
  SchemaResponse,
  SchemaResponseFieldDefinition,
  SchemaResponseTypeDefinition,
  SecondaryObjectType,
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
        .map((ot) => ({ ...ot, group: this.getLocalizedResource(`${ot.id}_description`) }))
        .sort(Utils.sortValues('label'))
        .sort((x, y) => (x.isFolder === y.isFolder ? 0 : x.isFolder ? -1 : 1)),
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
   * Get a particular secondary object type
   * @param objectTypeId ID of the object type
   * @param withLabel Whether or not to also add the types label
   */
  getSecondaryObjectType(objectTypeId: string, withLabel?: boolean): SecondaryObjectType {
    let objectType: SecondaryObjectType = this.system.secondaryObjectTypes.find((ot) => ot.id === objectTypeId);
    if (objectType && withLabel) {
      objectType.label = this.getLocalizedResource(`${objectType.id}_label`) || objectType.id;
    }
    return objectType;
  }

  /**
   * Floating secondary object types are secondary object types that could be applied
   * to an object dynamically.
   * @param objectTypeId ID of the object type to fetch the FSOTs for
   * @param withLabel Whether or not to also add the types label
   */
  getFloatingSecondaryObjectTypes(objectTypeId: string, withLabel?: boolean): SecondaryObjectType[] {
    const ot = this.getObjectType(objectTypeId);
    return ot.secondaryObjectTypes ? ot.secondaryObjectTypes.filter((sot) => !sot.static).map((sot) => this.getSecondaryObjectType(sot.id, withLabel)) : [];
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
    const props: ObjectTypeField = {
      id: '',
      propertyType: 'string',
      _internalType: 'string',
      description: '',
      cardinality: 'single',
      required: true,
      updatability: 'readwrite'
    };
    const secondaryFields: ObjectTypeField[] = [
      { ...props, id: SecondaryObjectTypeField.TITLE },
      { ...props, id: SecondaryObjectTypeField.DESCRIPTION }
    ];
    return {
      id: SystemType.OBJECT,
      // localNamespace: null,
      description: null,
      baseId: null,
      creatable: false,
      isFolder: false,
      secondaryObjectTypes: [],
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
      // AFOs (Advanced filing objects) should have a more prominent icon
      // TODO: Handle different icons in resources service
      if (this.isAFOType(type)) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/><path d="M0 0h24v24H0V0z" fill="none"/><circle fill="#fff" cx="18.1" cy="18" r="5"/><path class="accent" d="M18,12c-3.3,0-6,2.7-6,6s2.7,6,6,6c3.3,0,6-2.7,6-6S21.3,12,18,12z M20.5,21.6L18,20.1l-2.5,1.5l0.7-2.9l-2.2-1.9l3-0.3l1.2-2.7l1.2,2.7l3,0.3l-2.2,1.9L20.5,21.6z"/></svg>';
      } else {
        return type && type.isFolder
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
      }
    } else {
      return null;
    }
  }

  isAFOType(objectType: ObjectType): boolean {
    return Array.isArray(objectType.classification) && objectType.classification.includes(ObjectTypeClassification.ADVANCED_FILING_OBJECT);
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

  /**
   * Fetch a collection of form models.
   * @param objectTypeIDs Object type IDs to fetch form model for
   * @param situation Form situation
   * @returns Object where the object type id is key and the form model is the value
   */
  getObjectTypeForms(objectTypeIDs: string[], situation: string): Observable<{ [key: string]: any }> {
    return forkJoin(
      objectTypeIDs.map((o) =>
        this.getObjectTypeForm(o, situation).pipe(
          catchError((e) => of(null)),
          map((res) => ({
            id: o,
            formModel: res
          }))
        )
      )
    ).pipe(
      map((res) => {
        const resMap = {};
        res.forEach((r) => (resMap[r.id] = r.formModel));
        return resMap;
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
    const fetchTasks = [this.backend.get('/dms/schema/native.json', ApiBase.core), this.fetchLocalizations()];

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
    // prepare a quick access object for the fields
    let propertiesQA = {};
    schemaResponse.propertyDefinition.forEach((p: any) => {
      propertiesQA[p.id] = p;
    });
    // prepare a quick access object for object types (including secondary objects)
    let objectTypesQA = {};
    schemaResponse.typeFolderDefinition.forEach((ot: any) => {
      objectTypesQA[ot.id] = ot;
    });
    schemaResponse.typeDocumentDefinition.forEach((ot: any) => {
      objectTypesQA[ot.id] = ot;
    });
    schemaResponse.typeSecondaryDefinition.forEach((sot: any) => {
      objectTypesQA[sot.id] = sot;
    });

    const objectTypes: ObjectType[] = [
      // folder types
      ...schemaResponse.typeFolderDefinition.map((fd) => ({
        id: fd.id,
        description: fd.description,
        classification: fd.classification,
        baseId: fd.baseId,
        creatable: this.isCreatable(fd),
        contentStreamAllowed: ContentStreamAllowed.NOT_ALLOWED,
        isFolder: true,
        secondaryObjectTypes: fd.secondaryObjectTypeId ? fd.secondaryObjectTypeId.map((t) => ({ id: t.value, static: t.static })) : [],
        fields: this.resolveObjectTypeFields(fd, propertiesQA, objectTypesQA)
      })),
      // document types
      ...schemaResponse.typeDocumentDefinition.map((dd) => ({
        id: dd.id,
        description: dd.description,
        classification: dd.classification,

        baseId: dd.baseId,
        creatable: this.isCreatable(dd),
        contentStreamAllowed: dd.contentStreamAllowed,
        isFolder: false,
        secondaryObjectTypes: dd.secondaryObjectTypeId ? dd.secondaryObjectTypeId.map((t) => ({ id: t.value, static: t.static })) : [],
        fields: this.resolveObjectTypeFields(dd, propertiesQA, objectTypesQA)
      }))
    ];

    const secondaryObjectTypes: SecondaryObjectType[] = schemaResponse.typeSecondaryDefinition.map((std) => ({
      id: std.id,
      description: std.description,
      classification: std.classification,
      baseId: std.baseId,
      fields: this.resolveObjectTypeFields(std, propertiesQA, objectTypesQA)
    }));

    this.system = {
      version: schemaResponse.version,
      lastModificationDate: schemaResponse.lastModificationDate,
      objectTypes,
      secondaryObjectTypes,
      i18n: localizedResource
    };
    this.appCache.setItem(this.STORAGE_KEY, this.system).subscribe();
    this.systemSource.next(this.system);
  }

  /**
   * Resolve all the fields for an object type. This also includes secondary object types and the fields inherited from
   * the base type (... and of course the base type (and its secondary object types) of the base type and so on)
   * @param schemaTypeDefinition object type definition from the native schema
   * @param propertiesQA Quick access object of all properties
   * @param objectTypesQA Quick access object of all object types
   */
  private resolveObjectTypeFields(schemaTypeDefinition: SchemaResponseTypeDefinition, propertiesQA: any, objectTypesQA: any) {
    // const rootTypes = [SystemType.DOCUMENT, SystemType.FOLDER, SystemType.SOT];
    const objectTypeFieldIDs = schemaTypeDefinition.propertyReference.map((pr) => pr.value);
    if (schemaTypeDefinition.secondaryObjectTypeId) {
      schemaTypeDefinition.secondaryObjectTypeId
        .filter((sot) => sot.static)
        .map((sot) => sot.value)
        .forEach((sotID) => {
          objectTypesQA[sotID].propertyReference.forEach((pr) => {
            objectTypeFieldIDs.push(pr.value);
          });
        });
    }

    let fields = objectTypeFieldIDs.map((id) => ({
      ...propertiesQA[id],
      _internalType: this.getInternalFormElementType(propertiesQA[id], 'propertyType')
    }));

    // also resolve properties of the base type
    if (schemaTypeDefinition.baseId !== schemaTypeDefinition.id && !!objectTypesQA[schemaTypeDefinition.baseId]) {
      fields = fields.concat(this.resolveObjectTypeFields(objectTypesQA[schemaTypeDefinition.baseId], propertiesQA, objectTypesQA));
    }
    return fields;
  }

  private isCreatable(schemaTypeDefinition: SchemaResponseTypeDefinition) {
    return ![SystemType.FOLDER, SystemType.DOCUMENT].includes(schemaTypeDefinition.id);
  }

  /**
   * Generates an internal type for a given object type field.
   * Adding this to a form element or object type field enables us to render forms
   * based on object type fields in a more performant way. Otherwise we would
   * have to evaluate the conditions for every form element on every digest cycle.
   * @param field formElement from object type form model or object type field
   * @typeProperty the property on the field input that represents its type
   */
  getInternalFormElementType(field: SchemaResponseFieldDefinition, typeProperty: string): string {
    const classifications = this.getClassifications(field?.classification);

    if (field[typeProperty] === 'string' && classifications.has(Classification.STRING_REFERENCE)) {
      return InternalFieldType.STRING_REFERENCE;
    } else if (field[typeProperty] === 'string' && classifications.has(Classification.STRING_ORGANIZATION)) {
      return InternalFieldType.STRING_ORGANIZATION;
    } else if (field[typeProperty] === 'string' && classifications.has(Classification.STRING_CATALOG)) {
      return InternalFieldType.STRING_CATALOG;
    } else {
      // if there are no matching conditions just return the original type
      return field[typeProperty];
    }
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
        if (matches && matches.length) {
          res.set(matches[1], {
            classification: matches[1],
            options: matches[3] ? matches[3].split(',').map((o) => o.trim()) : []
          });
        }
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
