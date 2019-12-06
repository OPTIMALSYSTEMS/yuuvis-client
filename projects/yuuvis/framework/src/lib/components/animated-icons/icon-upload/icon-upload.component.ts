import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'yuv-icon-upload',
  templateUrl: './icon-upload.component.html',
  styleUrls: ['./icon-upload.component.scss']
})
export class IconUploadComponent {
  @Input() 
  set active(a: boolean) {
    this.isActive = a;
  }

  @HostBinding('class.active') isActive: boolean;
}
