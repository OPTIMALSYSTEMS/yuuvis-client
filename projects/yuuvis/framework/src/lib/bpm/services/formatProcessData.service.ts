import { Injectable } from '@angular/core';
import { FollowUpRow, Process, ProcessRow, ProcessStatus, SystemService, Task, TaskRow, TaskType, TranslateService } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { IconRegistryService } from './../../common/components/icon/service/iconRegistry.service';
import { GridService } from './../../services/grid/grid.service';
import { followUp, task } from './../../svg.generated';

type fieldName = 'taskName' | 'type' | 'subject' | 'createTime' | 'startTime' | 'businessKey' | 'expiryDateTime' | 'whatAbout' | 'status' | 'task';
@Injectable({
  providedIn: 'root'
})
export class FormatProcessDataService {
  private translations: any;

  constructor(
    private gridService: GridService,
    private iconRegService: IconRegistryService,
    private system: SystemService,
    private translate: TranslateService
  ) {
    this.iconRegService.registerIcons([task, followUp]);
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  private setTranslations() {
    this.translations = {
      type: this.translate.instant(`yuv.framework.process-list.column.type.label`),
      subject: this.translate.instant(`yuv.framework.process-list.column.subject.label`),
      taskName: this.translate.instant(`yuv.framework.process-list.column.task.label`),
      task: this.translate.instant(`yuv.framework.process-list.column.task.label`),
      createTime: this.translate.instant(`yuv.framework.process-list.column.createTime.label`),
      expiryDateTime: this.translate.instant(`yuv.framework.process-list.column.expiryDateTime.label`),
      startTime: this.translate.instant(`yuv.framework.process-list.column.startTime.label`),
      businessKey: this.translate.instant(`yuv.framework.process-list.column.businessKey.label`),
      status: this.translate.instant(`yuv.framework.process-list.column.status.label`),
      completed: this.translate.instant(`yuv.framework.process.status.completed.label`),
      suspended: this.translate.instant(`yuv.framework.process.status.suspended.label`),
      running: this.translate.instant(`yuv.framework.process.status.running.label`),
      followUpType: this.translate.instant(`yuv.framework.process-list.type.follow-up.label`),
      defaultFollowUpTaskName: this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskName`),
      defaultFollowUpProcessName: this.translate.instant(`yuv.framework.process.type.follow-up.defaultProcessName`),
      taskType: this.translate.instant(`yuv.framework.process-list.type.task.label`)
    };
  }

  // description => subject
  // process/inst => processes State
  // task/ => inbox State

  /**
   * Formating process data to fit for Grid in InboxState
   */
  formatTaskDataForTable(processData: Task[]): ResponsiveTableData {
    return this.processDataForTable(
      processData
        .map((data) => ({ ...data, icon: this.iconRegService.getIcon(data.processDefinition.id.startsWith('follow-up') ? 'followUp' : 'task') }))
        .map((data) => new TaskRow(data)),
      ['type', 'taskName', 'subject', 'createTime']
    );
  }

  /**
   * Formating process data to fit for Grid in ProcessState
   */
  formatProcessDataForTable(processData: Process[], fields: fieldName[]): ResponsiveTableData {
    return this.processDataForTable(
      processData
        .map((data) => ({ ...data, icon: this.iconRegService.getIcon(data.processDefinition.id.startsWith('follow-up') ? 'followUp' : 'task') }))
        .map((data) => new ProcessRow(data)),
      fields
    );
  }

  /**
   * Formating follow-up data to fit for Grid in ProcessState
   */
  formatFollowUpDataForTable(processData: Process[], fields: fieldName[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => ({ ...data, icon: this.iconRegService.getIcon('followUp') })).map((data) => new FollowUpRow(data)),
      fields
    );
  }

  private processDataForTable(rows: (ProcessRow | TaskRow)[], fields: fieldName[]): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        colId: field,
        field,
        width: field.toLowerCase().includes('type') ? 50 : undefined,
        headerClass: `col-header-type-${field}`,
        headerName: this.translations[field],
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        ...(field.toLowerCase().includes('status') && { cellRenderer: (params) => this.statusCellRenderer({ ...params, translations: this.translations }) }),
        ...(field.toLowerCase().includes('taskname') && {
          cellRenderer: (params) => this.taskNameCellRenderer({ ...params, context: { system: this.system, translations: this.translations } })
        }),
        ...(field.toLowerCase().includes('type') && {
          cellRenderer: (params) => this.typeCellRenderer({ ...params, translations: this.translations, context: { system: this.system } })
        }),
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

  private taskNameCellRenderer(params): string {
    let label = params.context.system.getLocalizedResource(`${params.value}_label`);
    if (!label && params.value === TaskType.FOLLOW_UP) {
      label = params.context.translations.defaultFollowUpTaskName;
    }
    return label || params.value;
  }

  private statusCellRenderer(params): string {
    let status, cssClass;
    switch (params.value) {
      case ProcessStatus.COMPLETED:
        status = params.translations.completed;
        cssClass = 'completed';
        break;
      case ProcessStatus.SUSPENDED:
        status = params.translations.suspended;
        cssClass = 'suspended';
        break;
      case ProcessStatus.RUNNING:
        status = params.translations.running;
        cssClass = 'running';
        break;
    }
    return `<span class="yuv-process-status ${cssClass}">${status}</span>`;
  }

  private typeCellRenderer(params): string {
    let icon;
    const pdn = params.data.processDefinitionName;
    let label = params.context.system.getLocalizedResource(`${pdn}_label`);
    if (!label && pdn === TaskType.FOLLOW_UP) {
      label = params.context.translations.defaultFollowUpProcessName;
    }
    switch (params.value) {
      case TaskType.FOLLOW_UP:
        icon = this.iconRegService.getIcon('followUp');
        break;
      case TaskType.TASK:
        icon = this.iconRegService.getIcon('task');
        break;
    }
    return `<div title="${label || pdn}">${icon}</div>`;
  }
}
