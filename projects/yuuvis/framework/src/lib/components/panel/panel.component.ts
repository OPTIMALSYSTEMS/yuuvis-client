import { Component, Input } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { clear } from './../../svg.generated';

/**
 * Component rendering a panel. Panels contain at least by a header
 * and a content section. But it could also contain a footer. Define the
 * actual content of each section by providing classes to child elements.
 *
 * @example
 * <yuv-panel [title]="'My Panel'">
 *   <div class="header">
 *
 *   </div>
 *   <div class="content">Main content section</div>
 *   <div class="footer">Footer content section</div>
 * </yuv-panel>
 */
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
