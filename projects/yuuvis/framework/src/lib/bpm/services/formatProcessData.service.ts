import { Injectable } from '@angular/core';
import { InboxItem, InboxItemType, Process, ProcessData, ProcessStatus, TaskData, TranslateService } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { IconRegistryService } from './../../common/components/icon/service/iconRegistry.service';
import { GridService } from './../../services/grid/grid.service';
import { followUp, task } from './../../svg.generated';

type fieldName = 'type' | 'subject' | 'createTime' | 'startTime' | 'businessKey' | 'expiryDateTime' | 'whatAbout' | 'status' | 'task';
@Injectable({
  providedIn: 'root'
})
export class FormatProcessDataService {
  private columnHeaderTranslations: { [key in fieldName]: string };

  constructor(private gridService: GridService, private iconRegService: IconRegistryService, private translate: TranslateService) {
    this.iconRegService.registerIcons([task, followUp]);
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  private setTranslations() {
    this.columnHeaderTranslations = {
      type: this.translate.instant(`yuv.framework.process-list.column.type.label`),
      subject: this.translate.instant(`yuv.framework.process-list.column.subject.label`),
      whatAbout: this.translate.instant(`yuv.framework.process-list.column.whatAbout.label`),
      task: this.translate.instant(`yuv.framework.process-list.column.task.label`),
      createTime: this.translate.instant(`yuv.framework.process-list.column.createTime.label`),
      expiryDateTime: this.translate.instant(`yuv.framework.process-list.column.expiryDateTime.label`),
      startTime: this.translate.instant(`yuv.framework.process-list.column.startTime.label`),
      businessKey: this.translate.instant(`yuv.framework.process-list.column.businessKey.label`),
      status: this.translate.instant(`yuv.framework.process-list.column.status.label`)
    };
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
      ['type', 'task', 'createTime']
    );
  }

  /**
   * Formating process data to fit for Grid in ProcessState
   */
  formatProcessDataForTable(processData: ProcessData[], fields: fieldName[]): ResponsiveTableData {
    return this.processDataForTable(
      processData
        .map((data) => ({ ...data, icon: this.iconRegService.getIcon(data.processDefinitionId.startsWith('follow-up') ? 'followUp' : 'task') }))
        .map((data) => new Process(data)),
      fields
    );
  }

  private processDataForTable(rows: (Process | InboxItem)[], fields: fieldName[]): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        colId: field,
        field,
        headerClass: `col-header-type-${field}`,
        headerName: this.columnHeaderTranslations[field],
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        ...(field.toLowerCase().includes('status') && { cellRenderer: (params) => this.statusCellRenderer({ ...params, translate: this.translate }) }),
        ...(field.toLowerCase().includes('type') && { cellRenderer: (params) => this.typeCellRenderer({ ...params, translate: this.translate }) }),
        resizable: true,
        sortable: true,
        ...(field.toLowerCase() === 'createTime' && { sort: 'asc' })
      })),
      rows,
      titleField: 'title',
      descriptionField: 'description',
      dateField: 'createTime',
      selectType: 'single'
    };
  }

  private statusCellRenderer(params): string {
    switch (params.value) {
      case ProcessStatus.COMPLETED:
        return params.translate.instant('yuv.framework.process-list.status.completed.label');
        break;
      case ProcessStatus.SUSPENDED:
        return params.translate.instant('yuv.framework.process-list.status.suspended.label');
        break;
      case ProcessStatus.RUNNING:
        return params.translate.instant('yuv.framework.process-list.status.running.label');
        break;
    }
  }

  private typeCellRenderer(params): string {
    let type;
    switch (params.value) {
      case InboxItemType.FOLLOW_UP:
        type = params.translate.instant('yuv.framework.process-list.type.follow-up.label');
        break;
      case InboxItemType.TASK:
        type = params.translate.instant('yuv.framework.process-list.type.task.label');
        break;
    }
    return type ? type : params.value;
  }
}
