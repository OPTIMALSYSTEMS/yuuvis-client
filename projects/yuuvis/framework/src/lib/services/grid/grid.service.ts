import { ColDef } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AppCacheService,
  BackendService,
  BaseObjectTypeField,
  ColumnConfig,
  ColumnConfigColumn,
  ContentStreamField,
  ObjectType,
  ObjectTypeField,
  SearchService,
  SystemService,
  TranslateService,
  UserConfigService,
  Utils
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileSizePipe, LocaleDatePipe, LocaleNumberPipe } from '../../pipes';
import { CellRenderer } from './grid.cellrenderer';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private COLUMN_WIDTH_CACHE_KEY_BASE = 'yuv.grid.column.width';

  context;

  constructor(
    private appCacheService: AppCacheService,
    private system: SystemService,
    private searchSvc: SearchService,
    private userConfig: UserConfigService,
    private translate: TranslateService,
    private router: Router,
    private backend: BackendService
  ) {
    this.context = {
      translate,
      system,
      backend,
      router,
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
    const objectType: ObjectType = objectTypeId ? this.system.getObjectType(objectTypeId) : this.system.getBaseType();
    const objectTypeFields = {};
    objectType.fields.forEach((f: ObjectTypeField) => (objectTypeFields[f.id] = f));
    return this.userConfig
      .getColumnConfig(objectTypeId)
      .pipe(
        map((cc: ColumnConfig) =>
          cc.columns.filter((c: ColumnConfigColumn) => c.propertyType !== 'table').map(c => this.getColumnDefinition(objectTypeFields[c.id], c))
        )
      );
  }

  getColumnDefinitions(objectTypeId?: string): ColDef[] {
    const objectType: ObjectType = objectTypeId ? this.system.getObjectType(objectTypeId) : this.system.getBaseType();
    return objectType.fields.map(f => this.getColumnDefinition(f));
  }

  /**
   * Generate column definitions for all fields
   * @param objectTypeId Object type to create the column definition for. Leave
   * blank in case of a mixed result list
   */
  getColumnDefinitions(objectTypeId?: string): ColDef[] {
    const objectType: ObjectType = objectTypeId ? this.system.getObjectType(objectTypeId) : this.system.getBaseType();
    return objectType.fields.map(f => this.getColumnDefinition({ id: f.id, label: '', propertyType: f.propertyType }, f));
  }

  /**
   * Creates a column definition for a given object type field.
   * @param columnConfig Column configuration entry
   * @param field Object type field matching the column config entry
   */
  private getColumnDefinition(field: ObjectTypeField, columnConfigColumn?: ColumnConfigColumn): ColDef {
    const colDef: ColDef = {
      colId: field.id, // grid needs unique ID
      field: field.id,
      headerName: this.system.getLocalizedResource(`${field.id}_label`),
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
    const skipSort = [BaseObjectTypeField.CREATED_BY, BaseObjectTypeField.MODIFIED_BY].map(s => s.toString());
    return field.propertyType !== 'id' && !skipSort.includes(field.id);
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
    colDef.cellClass = `col-${field.propertyType}`;
    colDef.headerClass = `col-header-${field.propertyType}`;

    switch (field.propertyType) {
      case 'string': {
        colDef.cellRenderer = params => Utils.escapeHtml(params.value);
        if (field.cardinality === 'multi') {
          colDef.cellRenderer = this.customContext(CellRenderer.multiSelectCellRenderer);
        }
        colDef.cellClass = field.cardinality === 'multi' ? 'multiCell string' : 'string';
        break;
      }
      case 'datetime': {
        colDef.width = 150;
        colDef.cellRenderer = this.customContext(CellRenderer.dateTimeCellRenderer, { pattern: field.resolution === 'date' ? 'eoShortDate' : 'eoShort' });
        break;
      }
      case 'integer': {
        const params = {
          scale: 0,
          grouping: true,
          pattern: undefined
        };
        colDef.width = 150;
        colDef.cellRenderer = this.customContext(CellRenderer.numberCellRenderer, params);
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
        colDef.cellRenderer = this.customContext(CellRenderer.numberCellRenderer, params);
        break;
      }
      // case 'NUMBER': {
      //   colDef.width = 150;
      //   const { scale, grouping, pattern } = resultField;
      //   colDef.cellRenderer = this.customContext(
      //     CellRenderer.numberCellRenderer,
      //     { scale, grouping, pattern }
      //   );
      //   colDef.getQuickFilterText = this.customContext(
      //     CellRenderer.numberCellRenderer,
      //     { scale, grouping, pattern }
      //   );
      //   break;
      // }
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
        colDef.width = 80;
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
    }
    return colDef;
  }

  private customContext(fnc, mixin?) {
    return params => fnc({ ...params, context: this.context, ...(mixin && mixin) });
  }

  public fileSizeKeyCreator(param) {
    if (!param.value) {
      return null;
    }
    const match = param.context.fileSizeOpts.find(f => f.from <= param.value && param.value < f.to);
    return match ? match.label : param.context.fileSizePipe.transform(param.value);
  }
}
