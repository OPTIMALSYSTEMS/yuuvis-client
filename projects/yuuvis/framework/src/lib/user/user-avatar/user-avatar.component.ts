import { Component, ElementRef, HostBinding, Input, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { YuvUser } from '@yuuvis/core';

@Component({
  selector: 'yuv-user-avatar',
  template: '',
  styleUrls: ['./user-avatar.component.scss'],
  host: { class: 'yuv-user-avatar' }
})
export class UserAvatarComponent {
  private defaultUserImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,.2)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

  @Input()
  set user(u: YuvUser) {
    this.getUserImage(u);
  }
  @HostBinding('style.backgroundImage') img: SafeStyle;

  constructor(private sanitizer: DomSanitizer, private elRef: ElementRef, private renderer: Renderer2) {
    this.setDefaulUserImage();
  }

  getUserImage(user: YuvUser) {
    if (user && user.image) {
      this.img = this.sanitizer.bypassSecurityTrustStyle(`url('${user.image}')`);
    } else if (user && !user.image && user.firstname && user.lastname) {
      this.img = null;
      this.elRef.nativeElement.classList.add('initials');
      const initials: HTMLElement = document.createElement('div');
      // scale initials font-size based on the containers size
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      // when rendered invisible the width will be 0px
      if (rect.width > 0) {
        initials.style.fontSize = `${rect.width * 0.5}px`;
      }
      initials.innerText = `${user.firstname.substr(0, 1)}${user.lastname.substr(0, 1)}`;
      this.renderer.appendChild(this.elRef.nativeElement, initials);
    } else {
      this.setDefaulUserImage();
    }
  }

  private setDefaulUserImage() {
    this.img = this.sanitizer.bypassSecurityTrustStyle(`url('${this.defaultUserImage}')`);
  }
}
