import { Injectable, ApplicationRef } from '@angular/core';
import { fromEvent, ReplaySubject, Observable } from 'rxjs';
import { Screen } from './screen.interface';
import { debounceTime } from 'rxjs/operators';

/**
 * Service for monitoring changes to the screen size.
 */

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  private screen: Screen;
  private screenSource = new ReplaySubject<Screen>(1);
  public screenChange$: Observable<Screen> = this.screenSource.asObservable();
  private resize$ = fromEvent(window, 'resize').pipe(debounceTime(500));

  constructor(private ref: ApplicationRef) {
    this.resize$.subscribe((e: Event) => {
      this.setScreen(e);
    });
    this.setScreen();
  }

  private setScreen(evt?: Event) {
    const bounds = document.getElementsByTagName('body')[0].getBoundingClientRect();
    this.screen = {
      usePhoneFlow: bounds.width <= 600,
      width: bounds.width,
      height: bounds.height,
    }
    this.screenSource.next(this.screen);
    this.ref.tick();
  }
}
