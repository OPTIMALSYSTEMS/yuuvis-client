import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { SystemService, Task } from '@yuuvis/core';
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
          description: this.system.getLocalizedResource(`${t.name}_label`) || t.name
        }
      : null;
  }
  @Input() panelOrder = ['taskTab', 'historyTab', 'attachmentsTab'];
  // @Input() layoutOptionsKey: string;
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.task-details`;
  }
  @Input() plugins: any;
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService) {}

  ngOnInit(): void {}
}
