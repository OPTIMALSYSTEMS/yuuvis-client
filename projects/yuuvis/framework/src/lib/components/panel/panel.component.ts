import { Component, Input } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { clear } from './../../svg.generated';
@Component({
  selector: 'yuv-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  host: { class: 'yuv-panel-wrapper' }
})
export class PanelComponent {
  @Input() title = '';
  @Input() description = '';

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear]);
  }
}
