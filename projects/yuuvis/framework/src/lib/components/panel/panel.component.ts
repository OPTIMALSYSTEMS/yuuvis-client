import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
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

  @Input() standaloneFullscreen: boolean;
  @HostBinding('class.standalone-fullscreen')
  public get isStandaloneFullscreen(): boolean {
    return this.standaloneFullscreen;
  }
  @Input() enableStandaloneBackButton: boolean;

  @Output() backButtonClick = new EventEmitter();

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear]);
  }

  clickBackButton() {
    this.backButtonClick.emit();
  }
}
