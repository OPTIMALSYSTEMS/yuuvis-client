import { animate, state, style, transition, trigger } from '@angular/animations';
/**
 * This class providing animation for an `ObjectCreateComponent`.
 */
export class FadeInAnimations {
  static fadeIn = trigger('fadeIn', [
    state('void', style({ opacity: '0' })),
    state('*', style({ opacity: '1' })),
    transition(`:enter`, animate(`{{time}} ease-in-out`))
  ]);
}
