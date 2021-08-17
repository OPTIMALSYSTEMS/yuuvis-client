import { Component, ContentChildren, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Task } from '@yuuvis/core';
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

  @Input() task: Task;
  @Input() panelOrder = ['taskTab', 'historyTab', 'attachmentsTab'];
  @Input() layoutOptionsKey: string;
  @Input() plugins: any;
  @Input() emptyMessage: string;

  constructor() {}

  zzz() {
    console.log(this.task.taskData);
  }

  ngOnInit(): void {}
}
