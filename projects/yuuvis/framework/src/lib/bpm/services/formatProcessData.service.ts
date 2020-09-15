import { Injectable } from '@angular/core';
import { FollowUp, InboxItem, ProcessData, Sort, SystemService, TaskData, Utils } from '@yuuvis/core';
import { ObjectTypeIconComponent } from '../../common/components/object-type-icon/object-type-icon.component';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from './../../services/grid/grid.service';

@Injectable({
  providedIn: 'root'
})
export class FormatProcessDataService {
  constructor(private systemService: SystemService, private gridService: GridService) {}

  // description => subject
  // process/inst => processes State
  // task/ => inbox State
  formatTaskDataForTable(processData: TaskData[]): ResponsiveTableData {
    return this.processDataForTable(processData.map((data) => new InboxItem(data)).sort(Utils.sortValues('expiryDateTime', Sort.ASC)), [
      'type',
      'subject',
      'expiryDateTime'
    ]);
  }

  formatProcessDataForTable(processData: ProcessData[]): ResponsiveTableData {
    return this.processDataForTable(processData.map((data) => new FollowUp(data)).sort(Utils.sortValues('expiryDateTime', Sort.ASC)), [
      'type',
      'subject',
      'expiryDateTime',
      'businessKey',
      'startTime'
    ]);
  }

  processDataForTable(rows: (FollowUp | InboxItem)[], fields: string[]): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        field,
        headerClass: `col-header-type-${field}`,
        headerName: this.systemService.getLocalizedResource(`${field}_label`),
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        ...(field.toLowerCase() === 'type' && { cellRendererFramework: ObjectTypeIconComponent }),
        resizable: true,
        sortable: true
      })),
      rows,
      titleField: 'title',
      descriptionField: 'description',
      dateField: 'expiryDateTime',
      selectType: 'single'
    };
  }
}
