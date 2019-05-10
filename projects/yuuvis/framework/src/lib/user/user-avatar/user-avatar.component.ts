import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { YuvUser } from '@yuuvis/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'yuv-user-avatar',
  template: '',
  styleUrls: ['./user-avatar.component.scss'],
  host: { 'class': 'yuv-user-avatar' }
})
export class UserAvatarComponent {

  private defaultUserImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,.2)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

  @Input() 
  set user(u: YuvUser) {
    this.getUserImage(u);
  }
  @HostBinding('style.backgroundImage') img: SafeStyle;

  constructor(private sanitizer: DomSanitizer) { 
    this.setDefaulUserImage();
  }

  getUserImage(user: YuvUser) {


    if(user && user.image) {

    } else if (user && user.email) {

    } else {
      this.setDefaulUserImage();
    }
  }

  private setDefaulUserImage() {
    this.img = this.sanitizer.bypassSecurityTrustStyle(
      `url('${this.defaultUserImage}')`
    );
  }
}
