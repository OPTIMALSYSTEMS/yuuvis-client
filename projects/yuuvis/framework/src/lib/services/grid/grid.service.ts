import { Injectable } from '@angular/core';
import { SystemService, TypeField } from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  context;

  constructor(private systemService: SystemService) {}

  getColumnConfiguration(objectTypeId?: string): ColDef[] {
    let typeFields: TypeField[];
    if (objectTypeId) {
      const objectType = this.systemService.getObjectType(objectTypeId);
      if (objectType) {
        typeFields = [...objectType.fields];
      }
    } else {
      typeFields = this.systemService.getBaseParamsTypeFields();
    }
    return typeFields.map(f => this.getColumnDefinition(f));
  }

  private getColumnDefinition(field: TypeField): ColDef {
    let colDef = <ColDef>{
      field: field.id === 'enaio:objectId' ? 'id' : field.id,
      headerName: this.systemService.getLocalizedResource(`${field.id}_label`)
    };

    colDef.suppressMovable = true;
    colDef.resizable = true;
    colDef.sortable = false;

    return colDef;
  }
}
