import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
/**
 * Directive keeping track of the focus beeing within a component. Once the component or
 * any of its child components gain focus, a class of `focusWithin` will be set on the
 * host component in order to allow styling it while beeing focused. Furthermore you can
 * register callbacks once the component gets or looses focus.
 *
 * @example
 * // just set the css class
 * <some-component yuvFocusWithin></some-component>
 * // set the css class and listen to focus changes
 * <some-component (yuvFocusWithin)="onFocusEnter()" (yuvFocusWithinBlur)="onFocusLeave()"></some-component>
 */
@Directive({
  selector: '[yuvFocusWithin]'
})
export class FocusWithinDirective {
  private eventCount = 0;
  @HostBinding('class.focusWithin') hasFocusWithin: boolean;
  @HostListener('focusin', ['$event']) onFocusIn(evt) {
    const hadFocusWithin = this.hasFocusWithin;
    this.hasFocusWithin = this.matchesFocusWithin();
    if (!hadFocusWithin && this.hasFocusWithin) {
      this.yuvFocusWithin.emit();
    }
  }
  @HostListener('focusout', ['$event']) onFocusOut(evt) {
    const hadFocusWithin = this.hasFocusWithin;
    this.hasFocusWithin = this.matchesFocusWithin();
    if (hadFocusWithin && !this.hasFocusWithin) {
      this.yuvFocusWithinBlur.emit();
    }
  }

  /**
   * Emitted once the component or any of its child components gains focus.
   */
  @Output() yuvFocusWithin = new EventEmitter();
  /**
   * Emitted once the component (incl. any of its child components) looses focus.
   */
  @Output() yuvFocusWithinBlur = new EventEmitter();

  constructor(private elRef: ElementRef) {}

  // Determine if the given node matches the given selector.
  // @see: https://www.bennadel.com/blog/3476-checking-to-see-if-an-element-has-a-css-pseudo-class-in-javascript.htm
  private matchesFocusWithin(): boolean {
    const node = this.elRef.nativeElement;
    var nativeMatches = node.matches || node.msMatchesSelector;
    try {
      return nativeMatches.call(node, ':focus-within');
    } catch (error) {
      return false;
    }
  }
}
