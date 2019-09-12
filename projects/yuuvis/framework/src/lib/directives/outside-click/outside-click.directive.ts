import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { EventService, YuvEventType } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Directive({
  selector: '[yuvOutsideClick]'
})
export class OutsideClickDirective implements OnDestroy {
  private active: boolean = true;

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.active && !event.defaultPrevented) {
      this.onOutsideEvent(event);
    }
  }

  @HostListener('document:mousedown', ['$event.target'])
  onMousedown(targetElement: HTMLElement) {
    if (this.active && !this._elementRef.nativeElement.contains(targetElement)) {
      this.onOutsideEvent(event);
    }
  }

  @Output() yuvOutsideClick = new EventEmitter();

  constructor(private eventService: EventService, private _elementRef: ElementRef) {
    this.eventService
      .on(YuvEventType.DIALOG_STACK_CHANGED)
      .pipe(takeUntilDestroy(this))
      .subscribe((event: any) => {
        this.active = !event.data.active;
      });
  }

  private onOutsideEvent(event: Event) {
    this.yuvOutsideClick.emit(event);
  }

  ngOnDestroy() {}
}
