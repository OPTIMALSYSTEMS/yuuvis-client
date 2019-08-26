import { Component, Input } from '@angular/core';

@Component({
  selector: 'yuv-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  host: { class: 'yuv-panel-wrapper' }
})
export class PanelComponent {
  @Input() title = '';
  @Input() description = '';
}
