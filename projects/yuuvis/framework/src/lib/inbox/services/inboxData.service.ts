import { Injectable } from '@angular/core';
import { ProcessData, SystemService, Utils } from '@yuuvis/core';

@Injectable()
export class InboxDataService {
  constructor(private systemService: SystemService) {}

  formatInboxProcessDataForTable(processData: ProcessData[]) {
    const colDef = processData.map((data) => {
      const variables = data.variables.filter((variable) => variable.name !== 'initiator');
      variables.push({ name: 'type', value: data.name }, { name: 'businessKey', value: data.businessKey });
      const columnDefs = [];
      const rowData = [];

      variables.map((variable) => {
        columnDefs.push({
          field: variable.name,
          headerClass: `col-header-type-${variable.name}`,
          headerName: this.systemService.getLocalizedResource(`${variable.name}_label`),
          resizable: true
        });
        rowData.push({ id: Utils.uuid(), [variable.name]: variable.value });
      });
      return [columnDefs, rowData];
    });
    const rows = colDef.map((col) => col[1].reduce((acc, row) => (acc = { ...acc, ...row })), {});
    return {
      columns: colDef[0][0],
      rows,
      titleField: 'colDef[0][0].processDefinitionName',
      descriptionField: 'data.processDefinitionDescription',
      selectType: 'single'
    };
  }
}
