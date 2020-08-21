import { Injectable } from '@angular/core';
import { ProcessData, SystemService, TaskData, Utils } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';

@Injectable()
export class FormatProcessDataService {
  constructor(private systemService: SystemService) {}

  formatProcessDataForTable(processData: TaskData[]): ResponsiveTableData {
    const colDef = processData.map((data) => {
      const variables = data.variables.filter((variable) => variable.name !== 'initiator');
      variables.push({ name: 'type', value: data.name }, { name: 'createTime', value: new Date(data.createTime) });
      const columnDefs = [];
      const rowData = [];

      variables.map((variable) => {
        console.log(variable.name, this.systemService.getLocalizedResource(`${variable.name}_label`));

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

  formatInboxProcessDataForTable(processData: ProcessData[]): ResponsiveTableData {
    const colDef = processData.map((data) => {
      const variables = data.variables.filter((variable) => variable.name !== 'initiator');
      variables.push(
        { name: 'type', value: data.name },
        { name: 'businessKey', value: data.businessKey },
        { name: 'startTime', value: new Date(data.startTime) }
      );
      const columnDefs = [];
      const rowData = [];

      variables.map((variable) => {
        console.log(variable.name, this.systemService.getLocalizedResource(`${variable.name}_label`));

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
