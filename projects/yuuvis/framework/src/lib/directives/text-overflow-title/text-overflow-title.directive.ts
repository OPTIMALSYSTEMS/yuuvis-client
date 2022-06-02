import { Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * Directive that adds a title to an HTML element if the whole
 * text content of that element is not visible. If you for example
 * have an element with 'text-overflow: ellipsis' a title attribute
 * with the whole text will be added while you see the '...' on the
 * elements content
 */
@Directive({
  selector: '[yuvTextOverflowTitle]'
})
export class TextOverflowTitleDirective implements OnDestroy {
  private changes: MutationObserver;

  constructor(private elementRef: ElementRef) {
    const e: HTMLElement = this.elementRef.nativeElement;

    this.changes = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.attributeName === 'style') {
          const isEllipsisActive = e.offsetWidth < e.scrollWidth;
          if (isEllipsisActive) {
            e.setAttribute('title', e.textContent);
          } else {
            e.removeAttribute('title');
          }
        }
      });
    });

    this.changes.observe(e, {
      attributes: true,
      childList: false,
      characterData: false
    });
  }

  ngOnDestroy() {
    this.changes.disconnect();
  }
}
