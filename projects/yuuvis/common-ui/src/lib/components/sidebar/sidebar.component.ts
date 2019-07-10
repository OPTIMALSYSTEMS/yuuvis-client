import { PlatformLocation } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { Position } from './sidebar.enum';

@Component({
  selector: 'yuv-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @HostListener('window:popstate') onpopstate() {
    if (this.display) {
      this.display = false;
    }
  }

  closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  @Input() display;
  @Input() width = 300;
  @Input() position = Position.LEFT;
  @Output() hide = new EventEmitter<any>();

  constructor(private location: PlatformLocation) {}

  onShow() {
    this.location.pushState({}, '', '');
  }
  onHide() {
    this.hide.emit();
  }
}
