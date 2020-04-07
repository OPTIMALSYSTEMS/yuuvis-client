import { Component, Input } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { arrowDown } from '../../../svg.generated';
import { SummaryEntry } from '../summary.interface';
@Component({
  selector: 'yuv-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss']
})
export class SummarySectionComponent {
  @Input() label: string;
  @Input() entries: SummaryEntry[];

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([arrowDown]);
  }

  toggle() {}
}
