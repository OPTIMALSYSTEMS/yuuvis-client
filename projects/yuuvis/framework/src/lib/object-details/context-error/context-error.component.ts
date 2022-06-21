import { Component, Input } from '@angular/core';

/**
 * Catch an error if the context is not displayed.
 *
 * @example
 * <yuv-context-error [contextError]="contextError"></yuv-context-error>
 */

@Component({
  selector: 'yuv-context-error',
  template: `<div class="error">
    <div class="message">{{ contextError }}</div>
    <ng-content></ng-content>
  </div>`,
  styles: [
    `
      .error {
        height: 100%;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
      }
      .error .message {
        padding: var(--app-pane-padding);
        border-radius: 2px;
        background-color: var(--color-error);
        color: #fff;
      }
    `
  ]
})
export class ContextErrorComponent {
  /**
   * Providing an error massage in case if for some reason the context is not displayed
   */
  @Input() contextError: string;
}
