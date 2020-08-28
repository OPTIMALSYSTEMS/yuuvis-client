import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { EventService, YuvEventType } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { PopoverService } from './../../popover/popover.service';

/**
 * Directive applying some action when the user clicked outside the host
 * component or hits ESC on the keyboard.
 *
 * @example
 * <div [yuvOutsideClick]="closeModalElement()">...</div>
 */
@Directive({
  selector: '[yuvOutsideClick]'
})
export class OutsideClickDirective implements OnDestroy {
  private active: boolean = true;

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.active && !this.popoverService.hasActiveOverlay && !event.defaultPrevented) {
      this.onOutsideEvent(event);
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    if (this.active && !this.popoverService.hasActiveOverlay && !this._elementRef.nativeElement.contains(event.target)) {
      this.onOutsideEvent(event);
    }
  }

  @Output() yuvOutsideClick = new EventEmitter();

  /**
   *
   * @ignore
   */
  constructor(private eventService: EventService, private popoverService: PopoverService, private _elementRef: ElementRef) {
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
