import { PlatformLocation } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Position } from './sidebar.enum';
/**
 * This component creates a sidebar.
 *
 * [Screenshot](../assets/images/yuv-sidebar.gif)
 *
 * @example
 * <yuv-sidebar [display]="showSideBar"></yuv-sidebar>
 */
@Component({
  selector: 'yuv-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit {
  @HostListener('window:popstate') onpopstate() {
    if (this.display) {
      this.display = false;
    }
  }

  closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  /**
   * Sets the visibility of the sidebar.
   */
  @Input() display;
  /**
   * Provides the visability of header in the sidebar.
   */
  @Input() showHeader = true;

  /**
   * Set the sidebar width in pixel (default: 300)
   * */
  @Input() width = 300;

  /**
   * Custom style for the sidebar header.
   */
  @Input() headerStyle = {};

  /**
   * Custom style for the sidebar content.
   */
  @Input() contentStyles = {};
  /**
   * Custom styling for the whole sidebar.
   */
  @Input() styles = {};

  /**
   * Sidebar position (where should it open).
   */
  @Input() position = Position.LEFT;

  /**
   * Emittet when the sidebar has been closed.
   */
  @Output() hide = new EventEmitter<any>();

  constructor(private location: PlatformLocation, private cdRef: ChangeDetectorRef) { }

  get externalHeaderStyle() {
    return { ...this.headerStyle };
  }
  get stylings() {
    return { ...this.styles, width: `${this.width}px` };
  }
  get externalContentStyles() {
    return { ...this.contentStyles };
  }

  onShow(navSideBar?: any) {
    this.location.pushState({}, '', '');
  }

  onHide(navSideBar?: any) {
    navSideBar?.destroyModal();
    this.hide.emit();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }
}
