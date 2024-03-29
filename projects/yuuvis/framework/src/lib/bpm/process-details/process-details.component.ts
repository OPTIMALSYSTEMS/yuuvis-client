import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ConfigService, Process, SystemService } from '@yuuvis/core';
import { TabPanelComponent } from '../../components/responsive-tab-container/tab-panel.component';

@Component({
  selector: 'yuv-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.scss']
})
export class ProcessDetailsComponent {
  @ContentChildren(TabPanelComponent) externalPanels: QueryList<TabPanelComponent>;
  @ViewChildren(TabPanelComponent) viewPanels: QueryList<TabPanelComponent>;
  @ViewChild('summary') summary: TemplateRef<any>;
  @ViewChild('history') history: TemplateRef<any>;
  @ViewChild('comments') comments: TemplateRef<any>;
  @ViewChild('attachments') attachments: TemplateRef<any>;

  _process: Process;
  header: {
    title: string;
    description: string;
  };
  @Input() panelOrder = ['summary', 'history', 'attachments', 'comments'];

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
  // list of types (object type IDs) that should not be offered when adding new attachments
  @Input() attachmentsSkipTypes: string[];
  @Input() plugins: any;
  @Input() attachmentPlugins: any;
  // bpm variables that should be shown in the process summary
  @Input() displayVars: string[] = [];
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private system: SystemService, private config: ConfigService) {
    this.panelOrder = this.config.get('client.processDetailsTabs') || this.panelOrder;
  }
}
