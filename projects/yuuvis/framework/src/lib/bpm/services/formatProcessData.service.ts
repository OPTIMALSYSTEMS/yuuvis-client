import { Injectable } from '@angular/core';
import { FollowUpRow, Process, ProcessRow, ProcessStatus, SystemService, Task, TaskRow, TaskType, TranslateService } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { IconRegistryService } from './../../common/components/icon/service/iconRegistry.service';
import { GridService } from './../../services/grid/grid.service';
import { followUp, task } from './../../svg.generated';

type fieldName = 'taskName' | 'type' | 'subject' | 'createTime' | 'endTime' | 'startTime' | 'businessKey' | 'expiryDateTime' | 'whatAbout' | 'status' | 'task';
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
      endTime: this.translate.instant(`yuv.framework.process-list.column.endTime.label`),
      businessKey: this.translate.instant(`yuv.framework.process-list.column.businessKey.label`),
      status: this.translate.instant(`yuv.framework.process-list.column.status.label`),
      completed: this.translate.instant(`yuv.framework.process.status.completed.label`),
      suspended: this.translate.instant(`yuv.framework.process.status.suspended.label`),
      running: this.translate.instant(`yuv.framework.process.status.running.label`),
      followUpType: this.translate.instant(`yuv.framework.process-list.type.follow-up.label`),
      defaultFollowUpTaskName: this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskName`),
      defaultFollowUpProcessName: this.translate.instant(`yuv.framework.process.type.follow-up.defaultProcessName`),
      taskType: this.translate.instant(`yuv.framework.process-list.type.task.label`),
      taskStateNotAssigned: this.translate.instant(`yuv.framework.process-list.task.state.not-assigned`),
      taskStateDelegated: this.translate.instant(`yuv.framework.process-list.task.state.delegated`),
      taskStateResolved: this.translate.instant(`yuv.framework.process-list.task.state.resolved`)
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
      ['type', 'taskName', 'subject', 'createTime'],
      true
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
      fields,
      false
    );
  }

  /**
   * Formating follow-up data to fit for Grid in ProcessState
   */
  formatFollowUpDataForTable(processData: Process[], fields: fieldName[]): ResponsiveTableData {
    return this.processDataForTable(
      processData.map((data) => ({ ...data, icon: this.iconRegService.getIcon('followUp') })).map((data) => new FollowUpRow(data)),
      fields,
      false
    );
  }

  private processDataForTable(rows: (ProcessRow | TaskRow)[], fields: fieldName[], isTask: boolean): ResponsiveTableData {
    return {
      columns: fields.map((field) => ({
        colId: field,
        field,
        width: field.toLowerCase().includes('type') ? 60 : undefined,
        headerClass: `col-header-type-${field}`,
        headerName: this.translations[field],
        ...(field.toLowerCase().includes('time') && { cellRenderer: this.gridService.dateTimeCellRenderer() }),
        ...(field.toLowerCase().includes('status') && { cellRenderer: (params) => this.statusCellRenderer({ ...params, translations: this.translations }) }),
        ...(field.toLowerCase().includes('taskname') && {
          cellRenderer: (params) => this.taskNameCellRenderer({ ...params, context: { system: this.system, translations: this.translations } })
        }),
        ...(field.toLowerCase().includes('type') && {
          cellRenderer: (params) => this.typeCellRenderer({ ...params, context: { translations: this.translations, system: this.system, isTask } })
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
    if (!label && params.data.originalData.processDefinition.idPrefix === TaskType.FOLLOW_UP) {
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

    let state = '';
    if (params.context.isTask) {
      const badgeStyle = 'style="width: 12px; height: 12px; fill: var(--color-accent); opacity: 1"';
      if (!params.data.data.assignee) {
        state = `<span title="${params.context.translations.taskStateNotAssigned}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${badgeStyle}><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></span>`;
      } else if (params.data.data.delegationState === 'pending') {
        state = `<span title="${params.context.translations.taskStateDelegated}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${badgeStyle}><g><rect fill="none" height="24" width="24"/></g><g><g><polygon points="15.5,5 11,5 16,12 11,19 15.5,19 20.5,12"/><polygon points="8.5,5 4,5 9,12 4,19 8.5,19 13.5,12"/></g></g></span>`;
      } else if (params.data.data.delegationState === 'resolved') {
        state = `<span title="${params.context.translations.taskStateResolved}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${badgeStyle}><g><rect fill="none" height="24" width="24"/></g><g><path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z"/></g></span>`;
      }
    }

    return `<span title="${label || pdn}">${icon}</span>${state}`;
  }
}
