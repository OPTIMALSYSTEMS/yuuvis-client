import { AfterViewInit, Attribute, Directive, ElementRef, Renderer2 } from '@angular/core';
import { Utils } from '@yuuvis/core';

/**
 * This directive will focus the first "focusable" element within its host.
 * You can also add a timeout, so host components that need some time for rendering can
 * be addressed as well.
 *
 * @example
 * <form yuvFocusFirst>...</form>
 * // will wait 1000 milliseconds before trying to focus
 * <form yuvFocusFirst="1000">...</form>
 */
@Directive({
  selector: '[yuvFocusFirst]'
})
export class FocusFirstDirective implements AfterViewInit {
  private id: string = Utils.uuid();
  private timeoutValue: number = 0;
  private selectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'checkbox:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  constructor(private el: ElementRef, @Attribute('yuvFocusFirst') public timeout: string, private render: Renderer2) {
    try {
      this.timeoutValue = parseInt(this.timeout);
    } catch (err) {
      console.error('Invalid input');
    }
  }

  ngAfterViewInit() {
    this.render.setAttribute(this.el.nativeElement, 'data-id', this.id);
    const parentSelectors = this.selectors.map(s => `[data-id="${this.id}"] ${s}`).join(',');
    setTimeout(() => {
      (document.querySelector(parentSelectors) as HTMLElement).focus();
    }, this.timeoutValue);
  }
}
