import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[yuvFocusWithin]'
})
export class FocusWithinDirective {

  @HostBinding('class.focusWithin') hasFocusWithin: boolean;
  @HostListener('focusin', ['$event']) onFocusIn(evt) {
    this.hasFocusWithin = true;
  }
  @HostListener('focusout', ['$event']) onFocusOut(evt) {
    this.hasFocusWithin = false;
  }
}
