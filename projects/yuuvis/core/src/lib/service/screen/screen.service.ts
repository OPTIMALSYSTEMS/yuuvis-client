import { ApplicationRef, Injectable } from '@angular/core';
import { fromEvent, Observable, ReplaySubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DeviceService } from './../device/device.service';
import { Screen } from './screen.interface';

/**
 * Service for monitoring changes to the screen size/orientation. Using `screenChange$` observable you are able to
 * monitor changes to the screen size and act upon it.
 *
 * This service will also add css classes to the body tag that reflect the current screen state. This way
 * you can apply secific styles in your css files for different screen resolutions and orientations.
 *
 * Classes applied to the body tag are:
 *
 * - `screen-s` - for mobile phone like screen sizes
 * - `screen-m` - for tablet like screen sizes
 * - `screen-l` - for desktop like screen sizes
 * - `screen-xl` - for screen sizes exceeding the desktop screen size
 *
 * - `screen-landscape` - for landscape orientation
 * - `screen-portrait` - for portrait orientation
 */

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  static MODE = {
    SMALL: 'screen-s', // 0-599 (Phones)
    MEDIUM: 'screen-m', // 600-899 for portrait, 900-1199 for landscape (Tablets)
    LARGE: 'screen-l', // 1200-1799 (Desktop)
    EXTRA_LARGE: 'screen-xl' // >1800
  };

  static ORIENTATION = {
    PORTRAIT: 'screen-portrait',
    LANDSCAPE: 'screen-landscape'
  };

  private static upperBoundary = {
    small: 600,
    mediumPortrait: 900,
    mediumLandscape: 1200,
    large: 1800
  };

  private screen: Screen;
  private screenSource = new ReplaySubject<Screen>(1);
  public screenChange$: Observable<Screen> = this.screenSource.asObservable();
  private resize$ = fromEvent(window, 'resize').pipe(debounceTime(this.getDebounceTime()));

  private static getMode(bounds: ClientRect, orientation: string): string {
    if (ScreenService.isBelow(ScreenService.upperBoundary.small, bounds)) {
      return ScreenService.MODE.SMALL;
    } else if (
      ScreenService.isBelow(
        orientation === ScreenService.ORIENTATION.LANDSCAPE ? ScreenService.upperBoundary.mediumLandscape : ScreenService.upperBoundary.mediumPortrait,
        bounds
      )
    ) {
      return ScreenService.MODE.MEDIUM;
    } else if (ScreenService.isBelow(ScreenService.upperBoundary.large, bounds)) {
      return ScreenService.MODE.LARGE;
    } else {
      return ScreenService.MODE.EXTRA_LARGE;
    }
  }

  private static isBelow(size: number, bounds: ClientRect): boolean {
    const landscape = bounds.width < ScreenService.upperBoundary.large ? bounds.width >= bounds.height : false;
    return (landscape && bounds.height < size) || (!landscape && bounds.width < size);
  }

  constructor(private ref: ApplicationRef, private device: DeviceService) {
    this.resize$.subscribe((e: Event) => {
      this.setScreen(e);
    });
    this.setScreen();
  }

  private setScreen(evt?: Event) {
    const bounds = document.getElementsByTagName('body')[0].getBoundingClientRect();
    let orientation = bounds.width >= bounds.height ? ScreenService.ORIENTATION.LANDSCAPE : ScreenService.ORIENTATION.PORTRAIT;

    if (this.device.isMobile && window.screen['orientation']) {
      const screenOrientation = window.screen['orientation'].type;
      if (screenOrientation === 'landscape-primary' || screenOrientation === 'landscape-secondary') {
        orientation = ScreenService.ORIENTATION.LANDSCAPE;
      } else if (screenOrientation === 'portrait-primary' || screenOrientation === 'portrait-secondary') {
        orientation = ScreenService.ORIENTATION.PORTRAIT;
      }
    }
    const mode = ScreenService.getMode(bounds, orientation);

    this.screen = {
      mode,
      orientation,
      width: bounds.width,
      height: bounds.height,
      isPortrait: orientation === ScreenService.ORIENTATION.PORTRAIT,
      isLanscape: orientation === ScreenService.ORIENTATION.LANDSCAPE,
      isSmall: mode === ScreenService.MODE.SMALL,
      isMedium: mode === ScreenService.MODE.MEDIUM,
      isLarge: mode === ScreenService.MODE.LARGE,
      isExtraLarge: mode === ScreenService.MODE.EXTRA_LARGE
    };
    // set according css classes to the body
    const bodyElements: HTMLCollectionOf<HTMLBodyElement> = document.getElementsByTagName('body');
    if (bodyElements.length) {
      bodyElements
        .item(0)
        .classList.remove(
          ScreenService.MODE.SMALL,
          ScreenService.MODE.MEDIUM,
          ScreenService.MODE.LARGE,
          ScreenService.MODE.EXTRA_LARGE,
          ScreenService.ORIENTATION.LANDSCAPE,
          ScreenService.ORIENTATION.PORTRAIT
        );
      bodyElements.item(0).classList.add(this.screen.mode, this.screen.orientation);
    }

    // emit screen changes
    this.screenSource.next(this.screen);
    // force change detection because resize will not be recognized by Angular in some cases
    this.ref.tick();
  }

  private getDebounceTime() {
    // on mobile devices resize only happens when rotating the divie or when
    // keyboard appears, so we dont't need to debounce
    return this.device.isMobile ? 0 : 500;
  }
}
