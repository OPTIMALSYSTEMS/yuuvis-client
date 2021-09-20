import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { SystemService, Task, TaskType, TranslateService } from '@yuuvis/core';
import { TabPanel } from 'primeng/tabview';

@Component({
  selector: 'yuv-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  @ContentChildren(TabPanel) externalPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewPanels: QueryList<TabPanel>;
  @ViewChild('taskTab') taskTab: TemplateRef<any>;
  @ViewChild('historyTab') historyTab: TemplateRef<any>;
  @ViewChild('attachmentsTab') attachmentsTab: TemplateRef<any>;

  _task: Task;
  header: {
    title: string;
    description: string;
  };
  @Input() set task(t: Task) {
    this._task = t;
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

  ngOnInit(): void {}
}