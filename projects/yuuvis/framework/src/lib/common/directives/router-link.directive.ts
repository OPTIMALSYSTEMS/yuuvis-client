import { Directive, ElementRef, HostListener } from '@angular/core';
import { Utils } from '@yuuvis/core';

/**
 * Direktive opens a new window for a redirection to another component.
 * @example
 * <a [routerLink]="['/some-link', secondParameter]">open</a>
 */
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
