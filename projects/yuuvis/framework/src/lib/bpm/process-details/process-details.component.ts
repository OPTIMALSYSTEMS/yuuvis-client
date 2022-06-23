import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Process, SystemService } from '@yuuvis/core';
import { TabPanelComponent } from '../../components/responsive-tab-container/tab-panel.component';

@Component({
  selector: 'yuv-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.scss']
})
export class ProcessDetailsComponent {
  @ContentChildren(TabPanelComponent) externalPanels: QueryList<TabPanelComponent>;
  @ViewChildren(TabPanelComponent) viewPanels: QueryList<TabPanelComponent>;
  @ViewChild('summaryTab') summaryTab: TemplateRef<any>;
  @ViewChild('historyTab') historyTab: TemplateRef<any>;
  @ViewChild('attachmentsTab') attachmentsTab: TemplateRef<any>;

  _process: Process;
  header: {
    title: string;
    description: string;
  };
  panelOrder = ['summaryTab', 'historyTab', 'attachmentsTab'];

  @Input() set process(p: Process) {
    this._process = p;
    this.header = p
      ? {
          title: this.system.getLocalizedResource(`${p.processDefinition.idPrefix}_label`) || p.processDefinition.idPrefix,
          description: p.subject
        }
      : null;
  }
  @Input() layoutOptionsKey: string;
  @Input() plugins: any;
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService) {}
}
