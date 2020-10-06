import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DmsObject } from '../../model/dms-object.model';
import { ApiBase } from '../backend/api.enum';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { Logger } from '../logger/logger';
import { Utils } from './../../util/utils';
import {
  BaseObjectTypeField,
  Classification,
  ContentStreamAllowed,
  InternalFieldType,
  ObjectTypeClassification,
  SecondaryObjectTypeClassification,
  SystemType
} from './system.enum';
import {
  ClassificationEntry,
  GroupedObjectType,
  ObjectType,
  ObjectTypeField,
  ObjectTypeGroup,
  SchemaResponse,
  SchemaResponseDocumentTypeDefinition,
  SchemaResponseFieldDefinition,
  SchemaResponseTypeDefinition,
  SecondaryObjectType,
  SystemDefinition
} from './system.interface';

/**
 * Providing system definitions.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private STORAGE_KEY = 'yuv.core.system.definition';
  // cached icons to avaoid backend calls (session cache)
  private iconCache = {};

  private system: SystemDefinition;
  private systemSource = new ReplaySubject<SystemDefinition>();
  public system$: Observable<SystemDefinition> = this.systemSource.asObservable();

  /**
   * @ignore
   */
  constructor(private backend: BackendService, private appCache: AppCacheService, private logger: Logger) {}

  /**
   * Get all object types
   * @param withLabels Whether or not to also add the types labels
   */
  getObjectTypes(withLabels?: boolean): ObjectType[] {
    return withLabels ? this.system.objectTypes.map((t) => ({ ...t, label: this.getLocalizedResource(`${t.id}_label`) })) : this.system.objectTypes;
  }

  /**
   * Get all secondary object types
   * @param withLabels Whether or not to also add the types labels
   */
  getSecondaryObjectTypes(withLabels?: boolean): SecondaryObjectType[] {
    return (
      (withLabels
        ? this.system.secondaryObjectTypes.map((t) => ({ ...t, label: this.getLocalizedResource(`${t.id}_label`) }))
        : this.system.secondaryObjectTypes
      )
        // ignore
        .filter((t) => t.id !== t.baseId && !t.id.startsWith('system:') && t.id !== 'appClientsystem:leadingType')
    );
  }

  /**
   * Returns grouped object types sorted by label and folders first.
   * This also includes floating object types.
   *
   * @param skipAbstract Whether or not to exclude abstract object types like e.g. 'system:document'
   * @param includeFloatingTypes Whether or not to include floating types as well
   * @param includeExtendableFSOTs Whether or not to include floating SOTs as well
   */
  getGroupedObjectTypes(
    skipAbstract?: boolean,
    includeFloatingTypes: boolean = true,
    includeExtendableFSOTs?: boolean,
    situation?: 'search' | 'create'
  ): ObjectTypeGroup[] {
    // TODO: Apply a different property to group once grouping is available
    const types: GroupedObjectType[] = [];
    this.getObjectTypes(true)
      .filter((ot) => (!includeFloatingTypes ? !ot.floatingParentType : true && (!skipAbstract || this.isCreatable(ot.id))))
      .forEach((ot) => {
        switch (situation) {
          case 'create': {
            if (!ot.classification?.includes(ObjectTypeClassification.CREATE_FALSE)) {
              types.push(ot);
            }
            break;
          }
          case 'search': {
            if (!ot.classification?.includes(ObjectTypeClassification.SEARCH_FALSE)) {
              types.push(ot);
            }
            break;
          }
          default: {
            types.push(ot);
          }
        }
      });

    if (includeExtendableFSOTs) {
      this.getSecondaryObjectTypes(true)
        .filter(
          (sot) =>
            !sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED) &&
            !sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)
        )
        .forEach((sot) => {
          types.push(sot);
        });
    }

    const grouped = this.groupBy(
      types
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
    const objectType: ObjectType = objectTypeId === SystemType.OBJECT ? this.getBaseType() : this.system.objectTypes.find((ot) => ot.id === objectTypeId);

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
    const objectType: SecondaryObjectType = this.system.secondaryObjectTypes.find((ot) => ot.id === objectTypeId);
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
   * Get the secondary object types of an object type that have the `primary`
   * classification.
   * @param objectTypeId ID of the object type
   * @param withLabel Whether or not to also add the types label
   */
  getPrimaryFSOTs(objectTypeId: string, withLabel?: boolean): SecondaryObjectType[] {
    return this.getFloatingSecondaryObjectTypes(objectTypeId, withLabel).filter((sot) =>
      sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)
    );
  }

  /**
   * Get the secondary object types of an object type that have the `required`
   * classification.
   * @param objectTypeId ID of the object type
   * @param withLabel Whether or not to also add the types label
   */
  getRequiredFSOTs(objectTypeId: string, withLabel?: boolean): SecondaryObjectType[] {
    return this.getFloatingSecondaryObjectTypes(objectTypeId, withLabel).filter((sot) =>
      sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED)
    );
  }

  /**
   * Extendable FSOTs are floating secondary object types that are FSOTs that are not
   * primary and not required.
   * @param objectTypeId ID of the object type
   * @param withLabel Whether or not to also add the types label
   */
  getExtendableFSOTs(objectTypeId: string, withLabel?: boolean): SecondaryObjectType[] {
    return this.getFloatingSecondaryObjectTypes(objectTypeId, withLabel).filter(
      (sot) =>
        !sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED) && !sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)
    );
  }

  /**
   * Applicable floating SOTs are SOTs that could be added by a users choice.
   * Regular floating SOTs may also contain SOTs that are applied
   * automatically (classification: 'appClient:required'). Those types will not be
   * returned here.
   *
   * There are also special AFSOTs: If they have a classification of 'appClient:primary' they
   * are supposed to be the leading object type once chosen.
   *
   * @param objectTypeId ID of the object type to fetch the FSOTs for
   * @param withLabel Whether or not to also add the types label
   */
  getApplicableFloatingSecondaryObjectTypes(objectTypeId: string, withLabel?: boolean): SecondaryObjectType[] {
    // all floating SOTs that are not classifoed as `required`
    return this.getFloatingSecondaryObjectTypes(objectTypeId, withLabel).filter(
      (sot) => !sot.classification.includes(SecondaryObjectTypeClassification.REQUIRED)
    );
  }

  /**
   * Returns the floating type of a dms object if available.
   * This is only possible if the dms object has been created from a certain kind of object type (Floating object type)
   * @param dmsObject Dms object to get the applied FOT for
   */
  getAppliedFloatingObjectType(dmsObject: DmsObject): SecondaryObjectType {
    return this.isFloatingObjectType(this.getObjectType(dmsObject.objectTypeId))
      ? dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].find((sot) => sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY))
      : null;
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
  getBaseType(includeClientDefaults?: boolean): ObjectType {
    const sysFolder = this.getBaseFolderType();
    const sysDocument = this.getBaseDocumentType();

    // base type contains only fields that are shared by base document and base folder ...
    const folderTypeFieldIDs = sysFolder.fields.map((f) => f.id);
    const baseTypeFields: ObjectTypeField[] = sysDocument.fields.filter((f) => folderTypeFieldIDs.includes(f.id));

    // leading type also needs to be added
    // TODO: make this a system property that is applied to all types
    this.getSecondaryObjectType('appClientsystem:leadingType').fields.forEach((f) => {
      baseTypeFields.push(f);
    });

    if (includeClientDefaults) {
      this.getSecondaryObjectType('appClient:clientdefaults').fields.forEach((f) => {
        baseTypeFields.push(f);
      });
    }
    return {
      id: SystemType.OBJECT,
      description: null,
      baseId: null,
      creatable: false,
      isFolder: false,
      secondaryObjectTypes: [],
      fields: baseTypeFields
    };
  }

  /**
   * Get the resolved object type with all fields ( including fields from related secondary types )
   */
  getResolvedType(objectTypeId?: string): { id: string; fields: ObjectTypeField[] } {
    const abstractTypes = Object.values(SystemType);
    if (!objectTypeId || abstractTypes.includes(objectTypeId)) {
      const baseType = this.getBaseType(true);
      return { id: baseType.id, fields: baseType.fields };
    }

    const ot = this.getObjectType(objectTypeId);
    if (!ot) {
      const sot = this.getSecondaryObjectType(objectTypeId) || { id: objectTypeId, fields: [] };
      const baseType = this.getBaseType(true);
      return {
        id: sot.id,
        fields: [...sot.fields, ...baseType.fields]
      };
    }

    return {
      id: ot.id,
      fields: ot.fields
    };
  }

  /**
   * Get the icon for an object type. This will return an SVG as a string.
   * @param objectTypeId ID of the object type
   * @param fallback ID of a fallback icon that should be used if the given object type has no icon yet
   */
  getObjectTypeIcon(objectTypeId: string, fallback?: string): Observable<string> {
    const fb = this.getFallbackIcon(objectTypeId, fallback);
    const uri = `/resources/icon/${encodeURIComponent(objectTypeId)}${fb ? `?fb=${encodeURIComponent(fallback)}` : ''}`;
    return !!this.iconCache[uri] ? of(this.iconCache[objectTypeId]) : this.backend.get(uri);
  }

  /**
   * Get the URI of an object type icon.
   * @param objectTypeId ID of the object type
   * @param fallback ID of a fallback icon that should be used if the given object type has no icon yet
   */
  getObjectTypeIconUri(objectTypeId: string, fallback?: string): string {
    const fb = this.getFallbackIcon(objectTypeId, fallback);
    const uri = `/resources/icon/${encodeURIComponent(objectTypeId)}${fb ? `?fallback=${encodeURIComponent(fb)}` : ''}`;
    return `${this.backend.getApiBase(ApiBase.apiWeb)}${uri}`;
  }

  private getFallbackIcon(objectTypeId: string, fallback?: string): string {
    const ot = this.getObjectType(objectTypeId);
    if (ot && !fallback) {
      // add default fallbacks for system:document and system:folder if now other fallback has been provided
      fallback = ot.isFolder ? 'system:folder' : 'system:document';
      if (this.isFloatingObjectType(ot)) {
        // types that do not have no object type assigned to them (primary FSOTs)
        fallback = 'system:dlm';
      }
    }
    return fallback;
  }

  /**
   * Get the leading object type ID for resolving object type icon and so on.
   * By default this is the actual object type id, but in case of floating types that are based
   * on floating secondary object types this will be one of the primary FSOTs.
   *
   * FOTs (floating object types) are object types that are based on a container type (the actual object type)
   * and contain a set of (bu tat least one) primary FSOTs (floating secondary object types).
   * Once one of the FSOTs is applied the FOT kind of becomes the secondary type.
   *
   * @param objectTypeId The object type ID
   * @param appliedSecondaryObjecttypeIDs List of applied secondary object types. This list
   * is supposed to be fetched from an actual instance (DmsObject) instead of fetching it from
   * the type definition (schema) because schema defines the types that are applicable whereas
   * the instance holds the types that are actually applied.
   */
  getLeadingObjectTypeID(objectTypeId: string, appliedSecondaryObjecttypeIDs?: string[]): string {
    if (appliedSecondaryObjecttypeIDs && this.isFloatingObjectType(this.getObjectType(objectTypeId))) {
      return (
        appliedSecondaryObjecttypeIDs
          .map((sot) => this.getSecondaryObjectType(sot))
          .find((sot) => sot?.classification?.includes(SecondaryObjectTypeClassification.PRIMARY))?.id || objectTypeId
      );
    } else {
      return objectTypeId;
    }
  }

  /**
   * Floating object types (FOT) are object types that can turn into different types using primary FSOTs.
   *
   * The origin type must have at least one non static (floating) secondary object type (SOT) that has a
   * classification of 'appClient:primary'. Those primary FSOTs define the types that the floating type may become.
   *
   * Once one primary FSOT has been applied to the FOT the FSOT will be treated like the main object type (leading type).
   */
  isFloatingObjectType(objectType: ObjectType): boolean {
    return objectType
      ? Array.isArray(objectType.classification) &&
          !!objectType.secondaryObjectTypes.find((sot) =>
            this.getSecondaryObjectType(sot.id).classification?.includes(SecondaryObjectTypeClassification.PRIMARY)
          )
      : false;
  }
  /**
   * Extendable object types (EOT) are object types that can be extended by loatin secondary object types (FSOTs).
   *
   * The origin type must have at least one floating object type that does not have a classification of 'appClient:primary'
   * or 'appClient:required'. These FSOTs can be added to the origin type to extend its set of indexdata.
   */
  isExtendableObjectType(objectType: ObjectType): boolean {
    return (
      Array.isArray(objectType.classification) &&
      objectType.secondaryObjectTypes.filter(
        (sot) =>
          !sot.static &&
          !this.getSecondaryObjectType(sot.id).classification?.includes(SecondaryObjectTypeClassification.PRIMARY) &&
          !this.getSecondaryObjectType(sot.id).classification?.includes(SecondaryObjectTypeClassification.REQUIRED)
      ).length > 0
    );
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
   * Fetch object form for a floating type.
   * @param floatingObjectTypeID The ID of a floating object type
   * @param situation Form situation
   */
  getFloatingObjectTypeForm(floatingObjectTypeID: string, situation?: string): Observable<any> {
    const floatingType = this.getObjectType(floatingObjectTypeID);
    if (!!floatingType.floatingParentType) {
      // get parent type
      const parentType = this.getObjectType(floatingType.floatingParentType);

      const querySotIDs = parentType.secondaryObjectTypes
        .filter((sot) => {
          const sotObj = this.getSecondaryObjectType(sot.id);
          return !sot.static && sotObj.classification?.includes(SecondaryObjectTypeClassification.REQUIRED);
        })
        .map((sot) => sot.id);
      return this.backend.get(this.buildFormFetchUri(floatingType.floatingParentType, [floatingObjectTypeID, ...querySotIDs], situation));
    } else {
      return of(null);
    }
  }

  private buildFormFetchUri(objectTypeID: string, sots?: string[], situation?: string): string {
    const params = sots ? sots.map((sot) => `sots=${sot}`) : [];
    if (situation) {
      params.push(`situation=${situation}`);
    }
    return `/dms/form/${objectTypeID}${params.length ? `?${params.join('&')}` : ''}`;
  }

  /**
   * Floating object types use more than one object type form.
   * In fact its a collection of forms that will be combined later on.
   * This method fetches all the forms bound to an floating object type.
   *
   * @param dmsObject a dms objectto get forms for
   * @returns object where 'main' property is the main object form, and extension is a
   * collection of all form the current object has been extended by (key: id, value: form model).
   */
  getDmsObjectForms(dmsObject: DmsObject, situation?: string): Observable<{ main: any; extensions: { [key: string]: any } }> {
    const ot = this.getObjectType(dmsObject.objectTypeId);

    const querySotIDs = [];
    const extendableSotIDs = [];
    const sots: string[] = dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS];
    if (sots) {
      const sotQA = {};
      ot.secondaryObjectTypes.forEach((sot: { id: string; static: boolean }) => (sotQA[sot.id] = sot));

      sots.forEach((sot) => {
        const sotRef = sotQA[sot];
        const sotObj = this.getSecondaryObjectType(sotRef.id);

        if (sotObj && !sotRef.static) {
          if (
            sotObj.classification?.includes(SecondaryObjectTypeClassification.PRIMARY) ||
            sotObj.classification?.includes(SecondaryObjectTypeClassification.REQUIRED)
          ) {
            querySotIDs.push(sot);
          } else {
            extendableSotIDs.push(sot);
          }
        }
      });
    }
    // const tasks = [this.backend.get(Utils.buildUri(`/dms/form/${ot.id}${querySotIDs.length ? `?sots=${querySotIDs.join('&sots=')}` : ''}`, { situation }))];
    const tasks = [this.backend.get(this.buildFormFetchUri(ot.id, querySotIDs, situation))];
    if (extendableSotIDs.length) {
      tasks.push(this.getObjectTypeForms(extendableSotIDs, situation));
    }
    return forkJoin(tasks).pipe(
      map((res) => ({
        main: res[0],
        extensions: res.length ? res[1] : null
      }))
    );
  }

  /**
   * Determine whether or not the given object type field is a system field
   * @param field Object type field to be checked
   */
  private isSystemProperty(field: ObjectTypeField): boolean {
    return field.id.startsWith('system:') || field.id === BaseObjectTypeField.LEADING_OBJECT_TYPE_ID;
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
        res.filter((r) => this.formHasElements(r.formModel)).forEach((r) => (resMap[r.id] = r.formModel));
        return resMap;
      })
    );
  }

  /**
   * Check whether or not the model has at least one form element. Recursive.
   * @param element Form element to check child elements for
   */
  private formHasElements(element: any): boolean {
    let hasElement = false;
    element.elements?.forEach((e) => {
      if (!['o2mGroup', 'o2mGroupStack'].includes(e.type)) {
        hasElement = true;
      } else if (!hasElement) {
        hasElement = this.formHasElements(e);
      }
    });
    return hasElement;
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
    const propertiesQA = {};
    const orgTypeFields = [BaseObjectTypeField.MODIFIED_BY, BaseObjectTypeField.CREATED_BY];
    schemaResponse.propertyDefinition.forEach((p: any) => {
      p.classifications = p.classification;
      // TODO: Remove once schema supports organization classification for base params
      // map certain fields to organization type (fake it until you make it ;-)
      if (orgTypeFields.includes(p.id)) {
        p.classifications = [Classification.STRING_ORGANIZATION];
      }
      propertiesQA[p.id] = p;
    });
    // prepare a quick access object for object types (including secondary objects)
    const objectTypesQA = {};
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
        // isFloatingType: false,
        baseId: fd.baseId,
        creatable: this.isCreatable(fd.id),
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
        // isFloatingType: false,
        baseId: dd.baseId,
        creatable: this.isCreatable(dd.id),
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
      contentStreamAllowed: std.contentStreamAllowed,
      baseId: std.baseId,
      fields: this.resolveObjectTypeFields(std, propertiesQA, objectTypesQA)
    }));

    // deal with floating types
    const floatingTypes: ObjectType[] = [];
    objectTypes.forEach((ot) => {
      const isFloatingType = !!ot.secondaryObjectTypes?.find((sot) =>
        objectTypesQA[sot.id]?.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)
      );
      if (isFloatingType) {
        const primaryFSOTs = ot.secondaryObjectTypes
          .filter((sot) => !sot.static)
          .map((sot) => objectTypesQA[sot.id])
          .filter((def: SchemaResponseDocumentTypeDefinition) => def.classification?.includes(SecondaryObjectTypeClassification.PRIMARY));

        // take care of 'required' FSOTs as well, because they are applied automatically,
        // so their fields are always part of the floating type
        const requiredFSOTs = ot.secondaryObjectTypes
          .filter((sot) => !sot.static)
          .map((sot) => objectTypesQA[sot.id])
          .filter((def: SchemaResponseTypeDefinition) => def.classification?.includes(SecondaryObjectTypeClassification.REQUIRED));

        primaryFSOTs.forEach((def: SchemaResponseDocumentTypeDefinition) => {
          floatingTypes.push({
            id: def.id,
            description: def.description,
            classification: def.classification,
            floatingParentType: ot.id,
            baseId: ot.baseId,
            creatable: ot.creatable && this.isCreatable(def.id),
            // FSOTs may have their own contentstreamAllowed property
            contentStreamAllowed: def.contentStreamAllowed || ot.contentStreamAllowed,
            isFolder: ot.isFolder,
            secondaryObjectTypes: [],
            fields: [...ot.fields, ...this.resolveObjectTypeFields(objectTypesQA[def.id], propertiesQA, objectTypesQA)].concat(
              ...requiredFSOTs.map((fsot) => this.resolveObjectTypeFields(objectTypesQA[fsot.id], propertiesQA, objectTypesQA))
            )
          });
        });
      }
    });

    this.system = {
      version: schemaResponse.version,
      lastModificationDate: schemaResponse.lastModificationDate,
      objectTypes: [...objectTypes, ...floatingTypes],
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

  private isCreatable(objectTypeId: string) {
    return ![SystemType.FOLDER, SystemType.DOCUMENT].includes(objectTypeId);
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
    const classifications = this.getClassifications(field?.classifications);

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
