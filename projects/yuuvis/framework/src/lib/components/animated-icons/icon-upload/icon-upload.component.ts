import { Component, HostBinding, Input } from '@angular/core';

/**
 * Upload icon used to visualize the process of uploading files to the backend.
 * It becomes visible and active during and after uploading files.
 *
 * [Screenshot](../assets/images/yuv-icon-upload.gif)
 *
 * @example
 *  <yuv-icon-upload [active]="!(someFunction$ | async)"></yuv-icon-upload>
 */
@Component({
  selector: 'yuv-icon-upload',
  templateUrl: './icon-upload.component.html',
  styleUrls: ['./icon-upload.component.scss']
})
export class IconUploadComponent {
  /**
   * Set the components `active` state. This will make the component visible.
   */
  @Input()
  set active(a: boolean) {
    this.isActive = a;
  }

  @HostBinding('class.active') isActive: boolean;
}
