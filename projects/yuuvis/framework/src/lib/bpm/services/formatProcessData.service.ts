import { Injectable } from '@angular/core';
import { FollowUp, InboxItem, ProcessData, SystemService, TaskData } from '@yuuvis/core';
import { ObjectTypeIconComponent } from '../../common/components/object-type-icon/object-type-icon.component';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { IconRegistryService } from './../../common/components/icon/service/iconRegistry.service';
import { GridService } from './../../services/grid/grid.service';
import { followUp, task } from './../../svg.generated';

@Injectable({
  providedIn: 'root'
})
export class FormatProcessDataService {
  constructor(private systemService: SystemService, private gridService: GridService, private iconRegService: IconRegistryService) {
    this.iconRegService.registerIcons([task, followUp]);
  }

  // description => subject
  // process/inst => processes State
  // task/ => inbox State

  /**
   * Formating process data to fit for Grid in InboxState
   */
  formatTaskDataForTable(processData: TaskData[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => ({ ...data, icon: this.iconRegService.getIcon('task') })).map((data) => new InboxItem(data)),
      ['type', 'subject', 'expiryDateTime']
    );
  }

  /**
   * Formating process data to fit for Grid in ProcessState
   */
  formatProcessDataForTable(processData: ProcessData[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => ({ ...data, icon: this.iconRegService.getIcon('followUp') })).map((data) => new FollowUp(data)),
      ['type', 'subject', 'expiryDateTime', 'businessKey', 'startTime']
    );
  }

  private processDataForTable(rows: (FollowUp | InboxItem)[], fields: string[]): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        field,
        headerClass: `col-header-type-${field}`,
        headerName: this.systemService.getLocalizedResource(`${field}_label`),
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        ...(field.toLowerCase() === 'type' && { cellRendererFramework: ObjectTypeIconComponent }),
        resizable: true,
        sortable: true,
        ...(field.toLowerCase() === 'expirydatetime' && { sort: 'asc' })
      })),
      rows,
      titleField: 'title',
      descriptionField: 'description',
      dateField: 'expiryDateTime',
      selectType: 'single'
    };
  }
}
