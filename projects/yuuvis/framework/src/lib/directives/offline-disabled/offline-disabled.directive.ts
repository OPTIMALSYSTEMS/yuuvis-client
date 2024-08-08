import { AfterViewInit, DestroyRef, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConnectionService, ConnectionState } from '@yuuvis/core';

/**
 * Directive to disable an element if offline.
 * Attach it to an element to disable it if the client is offline.
 * Pass in selector of child element to disable only the child element.
 *
 * @example
 * <!-- disable host element and all children when going offline -->
 * <div yuvOfflineDisabled>
 *   <form> ... </form>
 * </div>
 *
 * <!-- disable only buttons with class 'submit' within the host element -->
 * <div [yuvOfflineDisabled]="'button.submit'">
 *   <a href="home">Offline enabled link</a>
 *   <button class="submit">Disabled submit when offline</button>
 *   <button>Cancel (stays active while being offline)</button>
 * </div>
 */
@Directive({
  selector: '[yuvOfflineDisabled]'
})
export class OfflineDisabledDirective implements AfterViewInit, OnDestroy {
  /**
   * Selector of child element to be disabled.
   */
  @Input() yuvOfflineDisabled = '';

  destroyRef = inject(DestroyRef);

  /**
   *
   * @ignore
   */
  constructor(private element: ElementRef, private connectionService: ConnectionService) { }

  ngAfterViewInit() {
    let el = this.element.nativeElement;
    if (this.yuvOfflineDisabled) {
      el = el.querySelector(this.yuvOfflineDisabled);
    }
    const originalOpacity = el.style.opacity;
    const originalPointerEvents = el.style.pointerEvents;
    this.connectionService.connection$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((connectionState: ConnectionState) => {
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
