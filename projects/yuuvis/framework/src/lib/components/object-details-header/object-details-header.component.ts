import { Component, Input } from '@angular/core';
import { Position } from '@yuuvis/common-ui';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-object-details-header',
  templateUrl: './object-details-header.component.html',
  styleUrls: ['./object-details-header.component.scss']
})
export class ObjectDetailsHeaderComponent {
  icGlobe = SVGIcons.globe;
  kebap = SVGIcons.kebap;
  favorite = SVGIcons.favorite;
  refresh = SVGIcons.refresh;
  edit = SVGIcons.edit;
  showSideBar = false;
  sidebarStyle = { background: 'rgba(0, 0, 0, 0.8)' };
  headerStyle = {
    'grid-template-columns': '0.1fr 1fr',
    'grid-template-areas': 'close content'
  };
  position = Position.RIGHT;

  @Input() title = '';
  @Input() description = '';

  constructor() {}

  showActions() {
    this.showSideBar = !this.showSideBar;
  }
}
