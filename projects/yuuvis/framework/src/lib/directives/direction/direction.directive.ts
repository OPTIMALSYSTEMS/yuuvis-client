import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { Direction } from '@yuuvis/core';

@Directive({
  selector: '[yuvDirection]'
})
export class DirectionDirective {
  @Input() set yuvDirection(dir: string) {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'dir', dir);
    if (dir === Direction.RTL) {
      this._renderer.addClass(this._elementRef.nativeElement, 'yuv-rtl');
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement, 'yuv-rtl');
    }
  }

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}
}
