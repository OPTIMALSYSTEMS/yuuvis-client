import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { BaseObjectTypeField, Utils } from '@yuuvis/core';
import { arrowDown } from '../../../svg.generated';
import { SummaryEntry } from '../summary.interface';
@Component({
  selector: 'yuv-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss']
})
export class SummarySectionComponent {
  @Input() diff: boolean;
  @Input() set visible(v: boolean) {
    this.isVisible = v;
  }
  @Input() id: string;
  @Input() label: string;
  @Input() entries: SummaryEntry[];
  @Input() versionRouterLink: any[];
  @Output() visibilityChange = new EventEmitter<boolean>();

  @HostBinding('class.visible') isVisible: boolean;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([arrowDown]);
  }

  isVersion = v => v === BaseObjectTypeField.VERSION_NUMBER;
  isEmpty = v => Utils.isEmpty(v);

  classes = (v1, v2) => ({
    entry: true,
    diffActive: this.diff,
    new: this.diff && this.isEmpty(v1) && !this.isEmpty(v2),
    removed: this.diff && !this.isEmpty(v1) && this.isEmpty(v2),
    modified: this.diff && !this.isEmpty(v1) && !this.isEmpty(v2)
  });

  toggle() {
    this.visibilityChange.emit(!this.isVisible);
  }
}