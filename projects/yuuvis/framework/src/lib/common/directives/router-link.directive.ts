import { Directive, ElementRef, HostListener } from '@angular/core';
import { Utils } from '@yuuvis/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'a[routerLink]'
})
export class RouterLinkDirective {
  constructor(private hostElement: ElementRef) {}

  @HostListener('click', ['$event.ctrlKey'])
  onClick(ctrlKey: boolean): boolean {
    if (ctrlKey) {
      Utils.openWindow(this.hostElement.nativeElement.href); // open Window via javascript to ensure undockWindow connection
      return false;
    }
  }
}
