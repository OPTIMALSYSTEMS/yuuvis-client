import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackendService,
  ObjectTypeField,
  SystemService,
  TranslateService,
  Utils,
  YuvEnvironment
} from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
import { FileSizePipe, LocaleDatePipe, LocaleNumberPipe } from '../../pipes';
import { CellRenderer } from './grid.cellrenderer';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  context;

  constructor(
    private system: SystemService,
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
      cr: CellRenderer,
      baseHref: YuvEnvironment.isWebEnvironment() ? backend.getHost() : './'
      // fileSizeOpts: [],
      // mimetypegroupOpts: [],
      // typeOpts: [],
      // contextTypeOpts: []
    };
  }

  getColumnConfiguration(objectTypeId?: string): ColDef[] {
    let objectTypeFields: ObjectTypeField[];
    if (objectTypeId) {
      const objectType = this.system.getObjectType(objectTypeId);
      if (objectType) {
        objectTypeFields = [...objectType.fields];
      }
    } else {
      objectTypeFields = this.system.getBaseParamsTypeFields();
    }
    return objectTypeFields.map(f => this.getColumnDefinition(f));
  }

  private getColumnDefinition(field: ObjectTypeField): ColDef {
    let colDef = <ColDef>{
      field: field.id, // === 'enaio:objectId' ? 'id' : field.id,
      headerName: this.system.getLocalizedResource(`${field.id}_label`)
    };

    this.addColDefAttrsByType(colDef, field);
    this.addColDefAttrsByField(colDef, field);

    colDef.suppressMovable = true;
    colDef.resizable = true;
    colDef.sortable = false;

    return colDef;
  }

  /**
   * Add type specific column definition attributes based on a fields type
   *
   * @param colDef The column definition object to be extended by type specific attributes
   * @param field An object type field object
   *
   * @returns enriched column definition object
   */
  public addColDefAttrsByType(colDef: ColDef, field: ObjectTypeField) {
    colDef.cellClass = `col-${field.propertyType}`;
    colDef.headerClass = `col-header-${field.propertyType}`;

    switch (field.propertyType) {
      case 'string': {
        colDef.cellRenderer = params => Utils.escapeHtml(params.value);
        if (field.cardinality === 'multiple') {
          colDef.cellRenderer = CellRenderer.multiSelectCellRenderer;
        }
        colDef.cellClass =
          field.cardinality === 'multiple' ? 'multiCell string' : 'string';
        break;
      }
      case 'datetime': {
        colDef.width = 150;
        colDef.cellRenderer = this.customContext(
          CellRenderer.dateTimeCellRenderer,
          { pattern: 'eoShort' }
          // { pattern: resultField.withtime ? 'eoShort' : 'eoShortDate' }
        );
        break;
      }

      case 'integer': {
        const params = {
          scale: 1,
          grouping: false,
          pattern: undefined
        };
        colDef.width = 150;
        colDef.cellRenderer = this.customContext(
          CellRenderer.numberCellRenderer,
          params
        );
        break;
      }
      case 'decimal': {
        colDef.width = 150;
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
        colDef.cellRenderer = CellRenderer.booleanCellRenderer;
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
      case 'enaio:objectTypeId': {
        colDef.cellRenderer = this.customContext(CellRenderer.typeCellRenderer);
        colDef.width = 80;
        colDef.cellClass = 'res-ico';
        break;
      }
      case 'enaio:contentStreamMimeType': {
        colDef.width = 101;
        break;
      }
      case 'enaio:versionNumber': {
        colDef.width = 80;
        break;
      }
      case 'enaio:contentStreamLength': {
        colDef.width = 100;
        colDef.enableRowGroup = false;
        colDef.cellRenderer = CellRenderer.filesizeCellRenderer;
        colDef.keyCreator = this.customContext(this.fileSizeKeyCreator);
        break;
      }
    }
    return colDef;
  }

  private customContext(fnc, mixin?) {
    return param => {
      return fnc(Object.assign({}, param, { context: this.context }, mixin));
    };
  }

  public fileSizeKeyCreator(param) {
    if (!param.value) {
      return null;
    }
    let match = param.context.fileSizeOpts.find(
      f => f.from <= param.value && param.value < f.to
    );
    return match
      ? match.label
      : param.context.fileSizePipe.transform(param.value);
  }
}
