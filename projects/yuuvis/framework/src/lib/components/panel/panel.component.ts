import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { SVGIcons } from './../../svg.generated';

@Component({
  selector: 'yuv-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  host: { class: 'yuv-panel-wrapper' }
})
export class PanelComponent {
  closeIcon = SVGIcons.clear;

  @Input() title = '';
  @Input() description = '';

  @Input() standaloneFullscreen: boolean;
  @HostBinding('class.standalone-fullscreen')
  public get isStandaloneFullscreen(): boolean {
    return this.standaloneFullscreen;
  }
  @Input() enableStandaloneBackButton: boolean;

  @Output() backButtonClick = new EventEmitter();

  clickBackButton() {
    this.backButtonClick.emit();
  }
}
