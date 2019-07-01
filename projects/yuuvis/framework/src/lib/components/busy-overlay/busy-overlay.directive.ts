import { Directive, ElementRef, HostBinding, Input } from '@angular/core';
import { Utils } from '@yuuvis/core';

/**
 * A directive that will overlay its host component with a translucent background
 * and a loading spinner once the condition resolves with true. This is useful for example to
 * prevent user intercation while component data is loading or some processing is done.
 *
 * ```
 * <div class="result-list" [yuvBusyOverlay]="waitingForServerResponse">...</div>
 * ```
 */
@Directive({
  selector: '[yuvBusyOverlay]'
})
export class BusyOverlayDirective {
  @HostBinding('style.position') stylePosition = 'initial';

  private _overlayId;
  /**
   * The Boolean expression to evaluate as the condition for showing the busy overlay
   */
  @Input() set yuvBusyOverlay(b: boolean) {
    if (b === true) {
      this.addBusyOverlay();
    } else if (this._overlayId) {
      this.removeBusyOverlay();
    }
  }

  constructor(private element: ElementRef) {}

  private addBusyOverlay() {
    this.stylePosition = 'relative';
    const overlay = document.createElement('div');
    const overlayStyles = [
      'position: absolute',
      'transition: opacity 200ms',
      'opacity: 0',
      'top: 0',
      'bottom: 0',
      'left: 0',
      'right: 0',
      'background-color: rgba(255,255,255, .8)',
      'display: flex',
      'flex-flow: column',
      'align-items: center',
      'justify-content: center'
    ];
    this._overlayId = `p${Utils.uuid()}`;
    overlay.setAttribute('id', this._overlayId);
    overlay.setAttribute('style', overlayStyles.join(';'));

    const spinner = document.createElement('div');
    spinner.setAttribute('class', 'yuv-loader');
    overlay.append(spinner);

    this.element.nativeElement.append(overlay);
    setTimeout(() => {
      overlay.style.opacity = '1';
    });
  }

  private removeBusyOverlay() {
    const el = this.element.nativeElement.querySelector(`#${this._overlayId}`);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.remove();
      }, 200);
    }
    this._overlayId = null;
  }
}
