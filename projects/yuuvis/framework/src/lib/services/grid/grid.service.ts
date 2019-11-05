import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AppCacheService,
  BackendService,
  BaseObjectTypeField,
  ContentStreamField,
  FieldDefinition,
  ObjectType,
  ObjectTypeField,
  SearchService,
  SortOption,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
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
    return this.searchSvc.getFieldDefinition(objectType).pipe(
      map((fieldDef: FieldDefinition) => {
        const columns = fieldDef.elements.filter(f => f.propertyType !== 'table').map(f => this.getColumnDefinition(f, fieldDef.getOptions(f.id)));

        return columns;
      })
    );
  }

  /**
   * Creates a column definition for a given object type field.
   * @param field The field to create the column definition for
   */
  private getColumnDefinition(field: ObjectTypeField, options?: ColDef): ColDef {
    const colDef: ColDef = {
      field: field.id,
      headerName: this.system.getLocalizedResource(`${field.id}_label`)
    };

    this.addColDefAttrsByType(colDef, field);
    this.addColDefAttrsByField(colDef, field);

    colDef.suppressMovable = true;
    colDef.resizable = true;

    // TODO: apply conditions whether or not the column should be sortable
    if (this.isSortable(field)) {
      colDef.sortable = true;
    }

    return { ...colDef, ...options };
  }

  private isSortable(field: ObjectTypeField): boolean {
    const skipSort = [BaseObjectTypeField.CREATED_BY, BaseObjectTypeField.MODIFIED_BY].map(s => s.toString());
    return field.propertyType !== 'id' && !skipSort.includes(field.id);
  }

  /**
   * Saves column sort settings for a given object type.
   * @param sortModel Sort settings for columns
   * @param objectTypeId The ID of the object type to save column settings for
   */
  persistSortSettings(sortModel: SortOption[], objectTypeId?: string) {
    const objectType: ObjectType = objectTypeId ? this.system.getObjectType(objectTypeId) : this.system.getBaseDocumentType();
    this.searchSvc.updateFieldDefinition(objectType, sortModel, []);
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
        colDef.cellRenderer = this.customContext(CellRenderer.dateTimeCellRenderer, { pattern: 'eoShort' });
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
