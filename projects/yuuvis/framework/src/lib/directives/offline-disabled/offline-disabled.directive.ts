import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { ConnectionService, ConnectionState } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

/**
 * Directive to disable an element if offline.
 * Attach it to an element to disable it if the client is offline.
 * Pass in selector of child element to disable only the child element.
 */
@Directive({
  selector: '[yuvOfflineDisabled]'
})
export class OfflineDisabledDirective implements AfterViewInit, OnDestroy {

  /**
   * Selector of child element to be disabled.
   */
  @Input() yuvOfflineDisabled = '';

  constructor(private element: ElementRef, private connectionService: ConnectionService) { }

  ngAfterViewInit() {
    let el = this.element.nativeElement;
    if (this.yuvOfflineDisabled) {
      el = el.querySelector(this.yuvOfflineDisabled);
    }
    const originalOpacity = el.style.opacity;
    const originalPointerEvents = el.style.pointerEvents;
    this.connectionService.connection$.pipe(takeUntilDestroy(this)).subscribe((connectionState: ConnectionState) => {
      if (!connectionState.isOnline) {
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
      } else {
        el.style.opacity = originalOpacity;
        el.style.pointerEvents = originalPointerEvents;
      }
    });
  }

  ngOnDestroy() { }
}
