import { Injectable } from '@angular/core';
import { FollowUp, InboxItem, ProcessData, TaskData, TranslateService } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { IconRegistryService } from './../../common/components/icon/service/iconRegistry.service';
import { GridService } from './../../services/grid/grid.service';
import { followUp, task } from './../../svg.generated';

@Injectable({
  providedIn: 'root'
})
export class FormatProcessDataService {
  constructor(private gridService: GridService, private iconRegService: IconRegistryService, private translate: TranslateService) {
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
      processData
        .map((data) => ({ ...data, icon: this.iconRegService.getIcon(data.processDefinitionId.startsWith('follow-up') ? 'followUp' : 'task') }))
        .map((data) => new InboxItem(data)),
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
        colId: field,
        field,
        headerClass: `col-header-type-${field}`,
        headerName: this.translate.instant(`yuv.framework.process-list.column.${field}.label`),
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
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
