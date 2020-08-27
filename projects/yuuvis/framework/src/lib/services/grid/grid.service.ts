import { ColDef } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import {
  AppCacheService,
  BackendService,
  BaseObjectTypeField,
  Classification,
  ColumnConfig,
  ColumnConfigColumn,
  ContentStreamField,
  InternalFieldType,
  ObjectType,
  ObjectTypeField,
  SearchService,
  SystemService,
  SystemType,
  TranslateService,
  UserConfigService,
  Utils
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileSizePipe, LocaleDatePipe, LocaleNumberPipe } from '../../pipes';
import { CellRenderer } from './grid.cellrenderer';
/**
 * Providing grid configuration for components that use ag-grid.
 */
@Injectable({
  providedIn: 'root'
})
export class GridService {
  private COLUMN_WIDTH_CACHE_KEY_BASE = 'yuv.grid.column.width';
  /**
   * @ignore
   */
  context;

  /**
   * @ignore
   */
  constructor(
    private appCacheService: AppCacheService,
    private system: SystemService,
    private searchSvc: SearchService,
    private userConfig: UserConfigService,
    private translate: TranslateService,
    private backend: BackendService
  ) {
    this.context = {
      translate,
      system,
      backend,
      fileSizePipe: new FileSizePipe(translate),
      numberPipe: new LocaleNumberPipe(translate),
      datePipe: new LocaleDatePipe(translate),
      cr: CellRenderer
      // fileSizeOpts: [],
      // mimetypegroupOpts: [],
      // typeOpts: [],
      // contextTypeOpts: []
    };
  }

  /**
   * Generate column definitions.
   * @param objectTypeId Object type to create the column definition for. Leave
   * blank in case of a mixed result list
   */
  getColumnConfiguration(objectTypeId?: string): Observable<ColDef[]> {
    // Abstract types like `system:document` or `system:folder` should also fall back to the
    // mixed column configuration
    const abstractTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
    const objectType: ObjectType = !objectTypeId || abstractTypes.includes(objectTypeId) ? this.system.getBaseType() : this.system.getObjectType(objectTypeId);
    const objectTypeFields = {};
    objectType.fields.forEach((f: ObjectTypeField) => (objectTypeFields[f.id] = f));

    return this.userConfig.getColumnConfig(objectTypeId).pipe(
      map((cc: ColumnConfig) =>
        cc.columns
          // maybe there are columns that do not match the type definition anymore
          .filter((c) => !!objectTypeFields[c.id])
          .map((c) => this.getColumnDefinition(objectTypeFields[c.id], c))
      )
    );
  }

  /**
   * Generate column definitions for all fields
   * @param objectTypeId Object type to create the column definition for. Leave
   * blank in case of a mixed result list
   * @param isSecondaryObjectType Whether or not the given object ID belongs to a secndary object type
   */
  getColumnDefinitions(objectTypeId?: string, isSecondaryObjectType?: boolean): ColDef[] {
    if (isSecondaryObjectType) {
      return this.system.getSecondaryObjectType(objectTypeId).fields.map((f) => this.getColumnDefinition(f));
    } else {
      const objectType: ObjectType = objectTypeId ? this.system.getObjectType(objectTypeId) : this.system.getBaseType();
      return objectType.fields.map((f) => this.getColumnDefinition(f));
    }
  }

  /**
   * Creates a column definition for a given object type field.
   * @param columnConfig Column configuration entry
   * @param field Object type field matching the column config entry
   */
  private getColumnDefinition(field: ObjectTypeField, columnConfigColumn?: ColumnConfigColumn): ColDef {
    const colDef: ColDef = {
      colId: field?.id, // grid needs unique ID
      field: field?.id,
      headerName: this.system.getLocalizedResource(`${field?.id}_label`),
      pinned: columnConfigColumn ? columnConfigColumn.pinned || false : false
    };

    this.addColDefAttrsByType(colDef, field);
    this.addColDefAttrsByField(colDef, field);

    colDef.suppressMovable = true;
    colDef.resizable = true;

    // TODO: apply conditions whether or not the column should be sortable
    if (this.isSortable(field)) {
      colDef.sortable = true;
    }
    return colDef;
  }

  private isSortable(field: ObjectTypeField): boolean {
    const skipSort = [BaseObjectTypeField.CREATED_BY, BaseObjectTypeField.MODIFIED_BY].map((s) => s.toString());
    return field?.propertyType !== 'id' && !skipSort.includes(field?.id);
  }

  /**
   * add classification specific column definition attributes
   *
   * @param colDef - the column definition object to be extended
   * @param classification - the classification to evaluate
   *
   * @returns enriched column definition object
   */
  private fieldClassification(classification, params?) {
    if (!Array.isArray(classification)) {
      return undefined;
    }
    switch (classification[0]) {
      case Classification.STRING_EMAIL: {
        return CellRenderer.emailCellRenderer;
        break;
      }
      case Classification.STRING_URL: {
        return CellRenderer.urlCellRenderer;
        break;
      }
      case Classification.STRING_PHONE: {
        return CellRenderer.phoneCellRenderer;
        break;
      }
      case Classification.NUMBER_DIGIT: {
        return this.customContext(CellRenderer.numberCellRenderer, params);
        break;
      }
      default: {
        return undefined;
      }
    }
  }

  /**
   * Add type specific column definition attributes based on a fields type
   *
   * @param colDef The column definition object to be extended by type specific attributes
   * @param field An object type field object
   *
   * @returns enriched column definition object
   */
  private addColDefAttrsByType(colDef: ColDef, field: ObjectTypeField) {
    colDef.cellClass = `col-${field?.propertyType}`;
    colDef.headerClass = `col-header-${field?.propertyType}`;

    const internalType = this.system.getInternalFormElementType(field as any, 'propertyType');

    switch (internalType) {
      case InternalFieldType.STRING_REFERENCE: {
        //  colDef.cellRenderer = this.customContext(CellRenderer.referenceCellRenderer);
        // TODO: Replace actual implementation. Right now it's like 'string'
        // colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
        // if (field.cardinality === 'multi') {
        //   colDef.cellRenderer = this.customContext(CellRenderer.multiSelectCellRenderer);
        // }
        colDef.cellClass = field.cardinality === 'multi' ? 'multiCell string' : 'string';
        if (Array.isArray(field?.classifications)) {
          colDef.cellRenderer = this.fieldClassification(field?.classifications);
        }
        break;
      }
      case InternalFieldType.STRING_ORGANIZATION: {
        // TODO: Replace actual implementation. Right now it's like 'string'
        // colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
        // if (field.cardinality === 'multi') {
        //   colDef.cellRenderer = this.customContext(CellRenderer.multiSelectCellRenderer);
        // }
        colDef.cellClass = field.cardinality === 'multi' ? 'multiCell string' : 'string';
        if (Array.isArray(field?.classifications)) {
          colDef.cellRenderer = this.fieldClassification(field?.classifications);
        }
        break;
      }
      case 'string': {
        colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
        if (field.cardinality === 'multi') {
          colDef.cellRenderer = this.customContext(CellRenderer.multiSelectCellRenderer);
        }
        colDef.cellClass = field.cardinality === 'multi' ? 'multiCell string' : 'string';
        if (Array.isArray(field?.classifications)) {
          colDef.cellRenderer = this.fieldClassification(field?.classifications);
        }
        break;
      }
      case 'datetime': {
        colDef.width = 150;
        colDef.cellRenderer = this.dateTimeCellRenderer(field.resolution);
        break;
      }
      case 'integer': {
        const params = {
          scale: 0,
          grouping: true,
          pattern: undefined
        };
        colDef.width = 150;
        colDef.cellRenderer = this.fieldClassification(field?.classifications, params);
        break;
      }
      case 'decimal': {
        const params = {
          scale: 2,
          grouping: true,
          pattern: undefined,
          cips: true
        };
        colDef.width = 150;
        colDef.cellRenderer = this.fieldClassification(field?.classifications, params);
        break;
      }
      case 'boolean': {
        colDef.cellRenderer = this.customContext(CellRenderer.booleanCellRenderer);
        colDef.width = 100;
        break;
      }
    }
    return colDef;
  }

  /**
   * Add specific column definition attributes for special kind of fields
   *
   * @param colDef The column definition object to be extended by type specific attributes
   * @param field An object type field object
   *
   * @returns enriched column definition object
   */
  private addColDefAttrsByField(colDef: ColDef, field: ObjectTypeField) {
    switch (field.id) {
      case BaseObjectTypeField.OBJECT_TYPE_ID: {
        colDef.cellRenderer = this.customContext(CellRenderer.typeCellRenderer);
        colDef.cellClass = 'res-ico';
        break;
      }
      case ContentStreamField.MIME_TYPE: {
        colDef.width = 101;
        break;
      }
      case BaseObjectTypeField.VERSION_NUMBER: {
        colDef.width = 80;
        break;
      }
      case ContentStreamField.LENGTH: {
        colDef.width = 100;
        colDef.cellRenderer = this.customContext(CellRenderer.filesizeCellRenderer);
        colDef.keyCreator = this.customContext(this.fileSizeKeyCreator);
        break;
      }
      case BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS: {
        colDef.cellRenderer = this.customContext(CellRenderer.sotCellRenderer);
        break;
      }
    }
    return colDef;
  }

  private customContext(fnc, mixin?) {
    return (params) => fnc({ ...params, context: this.context, ...(mixin && mixin) });
  }
  /**
   *Return a string key for a value. This string is used  searching within cell editor dropdowns. 
    When filtering and searching the string is exposed to the user, so make sure to return a human-readable value.
   * 
   */
  public fileSizeKeyCreator(param) {
    if (!param.value) {
      return null;
    }
    const match = param.context.fileSizeOpts.find((f) => f.from <= param.value && param.value < f.to);
    return match ? match.label : param.context.fileSizePipe.transform(param.value);
  }

  public dateTimeCellRenderer(resolution?: string) {
    return this.customContext(CellRenderer.dateTimeCellRenderer, { pattern: resolution === 'date' ? 'eoShortDate' : 'eoShort' });
  }
}
