import { ColDef, Column, CsvExportParams, GridOptions, RowNode } from '@ag-grid-community/core';
import { Inject, Injectable } from '@angular/core';
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
  RetentionField,
  SearchService,
  SystemService,
  TranslateService,
  UserConfigService,
  UserService,
  Utils
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileSizePipe, LocaleDatePipe, LocaleNumberPipe } from '../../pipes';
import { ROUTES, YuvRoutes } from '../../routing/routes';
import { CellRenderer } from './grid.cellrenderer';

/**
 * Providing grid configuration for components that use ag-grid.
 */
@Injectable({
  providedIn: 'root'
})
export class GridService {
  private COLUMN_WIDTH_CACHE_KEY_BASE = 'yuv.grid.column.width';

  static AGGREGATED_COLUMN_PREFIX = 'agg:';

  static isSortable(field: ObjectTypeField): boolean {
    const skipSort = [BaseObjectTypeField.CREATED_BY, BaseObjectTypeField.MODIFIED_BY].map((s) => s.toString());
    return field?.propertyType !== 'id' && !skipSort.includes(field?.id);
  }

  // copy content of either row or table cell to clipboard
  public copyToClipboard(event: KeyboardEvent, gridOptions: GridOptions) {
    event.preventDefault();
    event.stopPropagation();

    const viewport = gridOptions.api['ctrlsService'].centerRowContainerCtrl.eViewport;
    const scrollLeft = viewport.scrollLeft;

    const focusedCell = gridOptions.api.getFocusedCell();
    const rows: RowNode[] = event.shiftKey ? gridOptions.api.getSelectedNodes() : [gridOptions.api.getDisplayedRowAtIndex(focusedCell.rowIndex)];
    const cols: Column[] = event.shiftKey ? gridOptions.columnApi.getAllDisplayedColumns() : [focusedCell.column];
    const getCell = (col, row) => viewport.parentElement.parentElement.querySelector(`div[row-index="${row.rowIndex}"] [col-id="${col.colId}"]`);
    const value = (col, row) => {
      gridOptions.api.ensureColumnVisible(col);
      const cell = getCell(col, row);
      if (!cell) return '';
      const chips = cell.querySelectorAll('.chip') || [];
      const val = Array.from(chips.length ? chips : [cell]).map((c: any) => (c && c.textContent && c.textContent.trim()) || '');
      const value = val.toString() || gridOptions.api.getValue(col, row);
      return !Utils.isEmpty(value) ? value.toString().replace(new RegExp('\n', 'g'), ' ') : '';
    };

    let content = '';
    if (event.altKey) content += cols.map((col: Column) => col.getColDef().headerName).join('	') + '\n';
    content += rows.map((row) => cols.map((col: Column) => value(col, row)).join('	')).join('\n');

    viewport.scrollLeft = scrollLeft + 1;
    setTimeout(
      () =>
        rows.map((row) =>
          cols.map((col: Column) => {
            const cell = getCell(col, row);
            cell && cell.classList.add('copy-cell');
            cell && setTimeout(() => cell && cell.classList.remove('copy-cell'), 4000);
          })
        ),
      100
    );

    navigator.clipboard.writeText(content);
  }

  /**
   * @ignore
   */
  context;

  get csvExportParams(): CsvExportParams {
    return {
      fileName: 'export',
      columnSeparator: this.context?.numberPipe.decimalSeparator === ',' ? ';' : ',',
      processCellCallback: (params) => {
        return ((params.column.getColDef().cellClass as any) || '').includes('col-decimal')
          ? (params.column.getColDef().cellRenderer as any)(params).replace(new RegExp(`\\` + this.context?.numberPipe.separator, 'g'), '') // removed grouping
          : params.value;
      }
    };
  }

  /**
   * @ignore
   */
  constructor(
    private appCacheService: AppCacheService,
    private system: SystemService,
    private searchSvc: SearchService,
    private userConfig: UserConfigService,
    private translate: TranslateService,
    private userService: UserService,
    private backend: BackendService,
    @Inject(ROUTES) private routes: YuvRoutes
  ) {
    this.context = {
      translate,
      system,
      backend,
      fileSizePipe: new FileSizePipe(translate),
      numberPipe: new LocaleNumberPipe(translate),
      datePipe: new LocaleDatePipe(translate),
      userService,
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
    return this.userConfig.getColumnConfig(objectTypeId).pipe(
      map((cc: ColumnConfig) => {
        return cc.columns.map((c) => this.getColumnDefinition(cc.fields[c.id], c));
      })
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
  getColumnDefinition(field: ObjectTypeField, columnConfigColumn?: ColumnConfigColumn): ColDef {
    const colDef: ColDef = {
      colId: field?.id, // grid needs unique ID
      field: field?.id,
      headerName: this.system.getLocalizedResource(`${field?.id}_label`),
      pinned: columnConfigColumn?.pinned || false,
      sort: columnConfigColumn?.sort || null
    };

    this.addColDefAttrsByType(colDef, field);
    this.addColDefAttrsByField(colDef, field);

    colDef.suppressMovable = true;
    colDef.resizable = true;

    // TODO: apply conditions whether or not the column should be sortable
    if (GridService.isSortable(field)) {
      colDef.sortable = true;
    }
    return colDef;
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
    if (classification[0].includes(Classification.STRING_REFERENCE)) {
      return this.customContext(CellRenderer.referenceCellRenderer, params);
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
      case Classification.STRING_ORGANIZATION: {
        return this.customContext(CellRenderer.organizationCellRenderer, params);
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
    const typeProperty = field['propertyType'] ? 'propertyType' : 'type';
    if (field) {
      colDef.cellClass = `col-${field[typeProperty]}`;
      colDef.headerClass = `col-header-${field[typeProperty]}`;
    }
    const internalType = this.system.getInternalFormElementType(field as any, typeProperty);

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
          const params = {
            url: this.routes && this.routes.object ? this.routes.object.path : null
          };
          colDef.cellRenderer = this.fieldClassification(field?.classifications, params);
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
        if (field.cardinality === 'multi') {
          colDef.cellRenderer = this.customContext(CellRenderer.multiSelectCellRenderer);
        }
        colDef.cellClass = field.cardinality === 'multi' ? 'multiCell string' : 'string';
        if (Array.isArray(field?.classifications)) {
          colDef.cellRenderer = this.fieldClassification(field?.classifications);
        }
        if (!colDef.cellRenderer) {
          colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
        }
        break;
      }
      case InternalFieldType.STRING_CATALOG: {
        colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
        break;
      }
      case InternalFieldType.STRING_DYNAMIC_CATALOG: {
        colDef.cellRenderer = (params) => Utils.escapeHtml(params.value);
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
        colDef.cellRenderer = field?.classifications
          ? this.fieldClassification(field?.classifications, params)
          : this.customContext(CellRenderer.numberCellRenderer, params);
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
        colDef.cellRenderer = field?.classifications
          ? this.fieldClassification(field?.classifications, params)
          : this.customContext(CellRenderer.numberCellRenderer, params);
        break;
      }
      case 'boolean': {
        colDef.cellRenderer = this.customContext(CellRenderer.booleanCellRenderer);
        colDef.width = 100;
        break;
      }
      case InternalFieldType.BOOLEAN_SWITCH: {
        colDef.cellRenderer = this.customContext(CellRenderer.booleanSwitchCellRenderer);
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
    const dateOnlyFields = [RetentionField.DESTRUCTION_DATE, RetentionField.RETENTION_START, RetentionField.RETENTION_END];
    if (dateOnlyFields.includes(field.id)) {
      colDef.width = 150;
      colDef.cellRenderer = this.dateTimeCellRenderer('date');
    } else {
      switch (field.id) {
        case BaseObjectTypeField.LEADING_OBJECT_TYPE_ID: {
          colDef.cellRenderer = 'objectTypeCellRenderer';
          colDef.width = 80;
          colDef.cellClass = 'res-ico';
          break;
        }
        case ContentStreamField.MIME_TYPE: {
          colDef.width = 101;
          break;
        }
        case BaseObjectTypeField.TAGS: {
          colDef.cellRenderer = this.customContext(CellRenderer.systemTagsCellRenderer);
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
    }
    return colDef;
  }

  customContext(fnc, mixin?) {
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
