import { Injectable } from '@angular/core';
import { FollowUp, InboxItem, ProcessData, SystemService, TaskData } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from './../../services/grid/grid.service';

@Injectable({ providedIn: 'root' })
export class FormatProcessDataService {
  constructor(private systemService: SystemService, private gridService: GridService) {}

  formatTaskDataForTable(processData: TaskData[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => new InboxItem(data)),
      ['description', 'expiryDateTime', 'type', 'createTime']
    );
  }

  formatProcessDataForTable(processData: ProcessData[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => new FollowUp(data)),
      ['description', 'expiryDateTime', 'type', 'businessKey', 'startTime']
    );
  }

  processDataForTable(rows: (FollowUp | InboxItem)[], fields: string[]): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        field,
        headerClass: `col-header-type-${field}`,
        headerName: this.systemService.getLocalizedResource(`${field}_label`),
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        resizable: true
      })),
      rows,
      titleField: 'title',
      descriptionField: 'description',
      dateField: 'expiryDateTime',
      selectType: 'single'
    };
  }
}
