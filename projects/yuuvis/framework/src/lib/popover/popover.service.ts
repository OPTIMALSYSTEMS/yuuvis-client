import { ComponentType, ConnectionPositionPair, FlexibleConnectedPositionStrategy, GlobalPositionStrategy, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector, TemplatePortal } from '@angular/cdk/portal';
import { ElementRef, Injectable, InjectionToken, Injector, TemplateRef } from '@angular/core';
import { Direction, Screen, ScreenService, UserService, YuvUser } from '@yuuvis/core';
import { PopoverConfig } from './popover.interface';
import { PopoverRef } from './popover.ref';
import { PopoverComponent } from './popover/popover.component';

/**
 * Injection token that can be used to access the data that was passed in to a popover.
 * */
export const POPOVER_DATA = new InjectionToken('yuv.framework.popover.data');

const defaultConfig: PopoverConfig = {
  backdropClass: '',
  disableClose: false,
  panelClass: ''
};
@Injectable({
  providedIn: 'root'
})
export class PopoverService {
  private useSmallDeviceLayout: boolean;
  private direction: string;

  constructor(private overlay: Overlay, private userService: UserService, private injector: Injector, private screenService: ScreenService) {
    this.screenService.screenChange$.subscribe((screen: Screen) => {
      this.useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;
    });
    this.userService.user$.subscribe((user: YuvUser) => {
      this.direction = user.uiDirection;
    });
  }

  /**
   * Opens a modal overlay.
   * @param componentOrTemplate The template or component to be displayed within the overlay
   * @param config Config to be passed to the component inside (data and settings for the look&feel of the popover)
   * @param target Optional target element to attach the overlay to. If not provided
   * overlay will go centered fullscreen.
   */
  open<D = any>(
    componentOrTemplate: ComponentType<any> | TemplateRef<any>,
    config: Partial<PopoverConfig> = {},
    target?: ElementRef | HTMLElement
  ): PopoverRef<D> {
    const popoverConfig: PopoverConfig = Object.assign({}, defaultConfig, config);
    const positionStrategy = this.getPositionStrategy(popoverConfig, target);
    const overlayConfig: OverlayConfig = {
      hasBackdrop: true,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    };

    const overlayRef = this.overlay.create(overlayConfig);
    overlayRef.setDirection(this.direction === Direction.RTL ? 'rtl' : 'ltr');
    const popoverRef = new PopoverRef(overlayRef, popoverConfig);

    const popover = overlayRef.attach(
      new ComponentPortal(
        PopoverComponent,
        null,
        new PortalInjector(
          this.injector,
          new WeakMap<any, any>([[PopoverRef, popoverRef]])
        )
      )
    ).instance;

    if (componentOrTemplate instanceof TemplateRef) {
      // rendering a provided template dynamically
      popover.attachTemplatePortal(
        new TemplatePortal(componentOrTemplate, null, {
          $implicit: config.data,
          popover: popoverRef
        })
      );
    } else {
      // rendering a provided component dynamically
      popover.attachComponentPortal(
        new ComponentPortal(
          componentOrTemplate,
          null,
          new PortalInjector(
            this.injector,
            new WeakMap<any, any>([
              [POPOVER_DATA, config.data],
              [PopoverRef, popoverRef]
            ])
          )
        )
      );
    }

    return popoverRef;
  }

  private getPositionStrategy(popoverConfig: PopoverConfig, target?: ElementRef | HTMLElement): GlobalPositionStrategy | FlexibleConnectedPositionStrategy {
    let positionStrategy;

    // On small screen devices we'll go 'fullscreen' even if
    // a target to attach to was provided
    if (this.useSmallDeviceLayout) {
      positionStrategy = this.overlay
        .position()
        .global()
        .width('90%')
        .height('90%')
        .centerHorizontally()
        .centerVertically();
    } else {
      // if a target is provided, the popover will be attached to that element
      if (target) {
        // preferred positions, in order of priority
        const positions: ConnectionPositionPair[] = [
          {
            overlayX: 'start',
            overlayY: 'top',
            originX: 'start',
            originY: 'bottom',
            panelClass: ['top', 'left'],
            offsetY: 4
          }
        ];
        positionStrategy = this.overlay
          .position()
          .flexibleConnectedTo(target)
          .withPush(true)
          .withViewportMargin(16)
          .withFlexibleDimensions(false)
          .withPositions(positions);
      } else {
        // position strategy for fullscreen centered overlays
        positionStrategy = this.overlay
          .position()
          .global()
          .width(`${popoverConfig.width}` || '10%')
          .height(`${popoverConfig.height}` || '10%')
          .centerHorizontally()
          .centerVertically();
      }
    }
    return positionStrategy;
  }
}
