import { Component, Input } from '@angular/core';

@Component({
  selector: 'yuv-context-error',
  template: `<div class="error" *ngIf="contextError">
    <div class="message">{{ contextError }}</div>
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
      }
    `
  ]
})
export class ContextErrorComponent {
  @Input() contextError: string;
}
