import { Component, Input } from '@angular/core';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-object-details-header',
  templateUrl: './object-details-header.component.html',
  styleUrls: ['./object-details-header.component.scss']
})
export class ObjectDetailsHeaderComponent {
  icClear = SVGIcons.clear;

  @Input('title') title = '';
  @Input('description') description = '';

  constructor() {}
}
