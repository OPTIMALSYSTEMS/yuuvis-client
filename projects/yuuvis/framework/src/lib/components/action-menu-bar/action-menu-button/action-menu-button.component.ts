import { Component, Input } from '@angular/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { kebap } from '../../../svg.generated';

@Component({
  selector: 'yuv-action-menu-button',
  template: `<yuv-icon [icon]="'kebap'" [ngClass]="{ disabled: disabled || loading, spinning: loading }"></yuv-icon>`,
  styleUrls: ['./action-menu-button.component.scss']
})
export class ActionMenuButtonComponent {
  @Input() disabled: boolean;
  @Input() loading: boolean;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([kebap]);
  }
}
