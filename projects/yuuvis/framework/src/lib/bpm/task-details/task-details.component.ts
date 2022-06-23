import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { SystemService, Task, TaskType, TranslateService } from '@yuuvis/core';
import { TabPanelComponent } from '../../components/responsive-tab-container/tab-panel.component';

@Component({
  selector: 'yuv-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  @ContentChildren(TabPanelComponent) externalPanels: QueryList<TabPanelComponent>;
  @ViewChildren(TabPanelComponent) viewPanels: QueryList<TabPanelComponent>;
  @ViewChild('taskTab') taskTab: TemplateRef<any>;
  @ViewChild('historyTab') historyTab: TemplateRef<any>;
  @ViewChild('attachmentsTab') attachmentsTab: TemplateRef<any>;

  _task: Task;
  header: {
    title: string;
    description: string;
  };
  dueDate: {
    date: Date;
    overDue: boolean;
  };
  @Input() set task(t: Task) {
    this._task = t;
    this.dueDate =
      t && t.dueDate
        ? {
            date: new Date(t.dueDate),
            overDue: new Date(t.dueDate).getTime() < Date.now()
          }
        : undefined;
    this.header = t
      ? {
          title: t.subject,
          description: this.getDescription(t)
        }
      : null;
  }
  @Input() panelOrder = ['taskTab', 'historyTab', 'attachmentsTab'];
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.task-details`;
  }
  @Input() plugins: any;
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService, private translate: TranslateService) {}

  private getDescription(t: Task): string {
    let label = this.system.getLocalizedResource(`${t.name}_label`);
    if (!label && t.name === TaskType.FOLLOW_UP) {
      label = this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskName`);
    }
    return label || t.name;
  }

  onTaskUpdated(task: Task) {
    this.task = task;
  }

  ngOnInit(): void {}
}
