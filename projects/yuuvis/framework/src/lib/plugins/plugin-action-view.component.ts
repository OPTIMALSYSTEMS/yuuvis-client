import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionComponent } from '../actions/interfaces/action-component.interface';

@Component({
  selector: 'yuv-plugin-action-view',
  template: `
    <yuv-plugin [config]="action" [parent]="parent || this"></yuv-plugin>
    <div *ngIf="action?.buttons" class="footer">
      <button class="btn" (click)="onCancel()">{{ action.buttons.cancel || 'yuv.framework.shared.cancel' | translate }}</button>
      <button class="btn primary" [disabled]="disabled" (click)="onFinish()">{{ action.buttons.finish || 'yuv.framework.shared.change' | translate }}</button>
    </div>
  `,
  styles: [
    `
      :host {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--color-background);
      }
      yuv-plugin {
        display: flex;
        flex: 1;
      }
      .footer {
        padding: calc(var(--app-pane-padding) / 2) var(--app-pane-padding);
        display: flex;
        justify-content: flex-end;
      }
    `
  ]
})
export class PluginActionViewComponent implements ActionComponent {
  @Input() disabled = false;

  @Input() parent: any;

  @Input() action: any;

  @Input() selection: any[];

  @Output() finished: EventEmitter<any> = new EventEmitter<any>();

  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  onCancel() {
    this.canceled.emit();
  }

  onFinish() {
    this.finished.emit();
  }
}
