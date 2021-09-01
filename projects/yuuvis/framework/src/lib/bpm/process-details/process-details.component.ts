import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Process, SystemService } from '@yuuvis/core';
import { TabPanel } from 'primeng/tabview';

@Component({
  selector: 'yuv-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.scss']
})
export class ProcessDetailsComponent {
  @ContentChildren(TabPanel) externalPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewPanels: QueryList<TabPanel>;
  @ViewChild('summaryTab') summaryTab: TemplateRef<any>;
  @ViewChild('attachmentsTab') attachmentsTab: TemplateRef<any>;

  _process: Process;
  header: {
    title: string;
    description: string;
  };
  panelOrder = ['summaryTab', 'attachmentsTab'];

  @Input() set process(p: Process) {
    this._process = p;
    this.header = p
      ? {
          title: p.subject,
          description: this.system.getLocalizedResource(`${p.name}_label`) || p.name
        }
      : null;
  }
  @Input() layoutOptionsKey: string;
  @Input() plugins: any;
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService) {}
}
