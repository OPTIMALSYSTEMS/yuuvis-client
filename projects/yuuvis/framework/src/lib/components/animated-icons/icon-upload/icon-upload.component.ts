import { Component, HostBinding, Input } from '@angular/core';

/**
 * Upload icon used to visualize the process of downloading files to the client.
 * It becomes visible and active during and after downloading files.
 * The rest of the time the icon is not visible.
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
   * Gets css class active when uploading files
   */
  @Input()
  set active(a: boolean) {
    this.isActive = a;
  }

  @HostBinding('class.active') isActive: boolean;
}
