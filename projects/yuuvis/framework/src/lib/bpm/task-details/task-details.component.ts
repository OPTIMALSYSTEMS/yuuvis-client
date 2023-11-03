import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ConfigService, InboxService, SystemService, Task, TaskType, TranslateService } from '@yuuvis/core';
import { TabPanelComponent } from '../../components/responsive-tab-container/tab-panel.component';

@Component({
  selector: 'yuv-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  @ContentChildren(TabPanelComponent) externalPanels: QueryList<TabPanelComponent>;
  @ViewChildren(TabPanelComponent) viewPanels: QueryList<TabPanelComponent>;
  @ViewChild('summary') summary: TemplateRef<any>;
  @ViewChild('history') history: TemplateRef<any>;
  @ViewChild('attachments') attachments: TemplateRef<any>;
  @ViewChild('comments') comments: TemplateRef<any>;

  _task: Task;
  _error: any;
  busy: boolean;
  header: {
    title: string;
    description: string;
  };
  dueDate: {
    date: Date;
    overDue: boolean;
  };
  @Input() set processInstanceId(id: string) {
    if (id) {
      this.busy = true;
      this.inboxService
        .getTask(id)
        .subscribe({
          next: (t: Task) => {
            this.task = t;
            this._error = null;
          },
          error: (e) => {
            this.task = null;
            this._error = e;
          }
        })
        .add(() => (this.busy = false));
    }
  }

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
  @Input() panelOrder = ['summary', 'history', 'attachments', 'comments'];
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.task-details`;
  }
  @Input() plugins: any;
  @Input() attachmentPlugins: any;
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService, private inboxService: InboxService, private translate: TranslateService, private config: ConfigService) {
    this.panelOrder = this.config.get('client.taskDetailsTabs') || this.panelOrder;
  }

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
