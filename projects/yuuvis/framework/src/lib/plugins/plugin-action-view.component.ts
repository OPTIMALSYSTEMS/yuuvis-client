import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionComponent } from '../actions/interfaces/action-component.interface';
import { PluginsService } from './plugins.service';

@Component({
  selector: 'yuv-plugin-action-view',
  template: `
    <yuv-plugin [config]="action" [parent]="parent || this"></yuv-plugin>
    <div *ngIf="action?.buttons" class="footer">
      <button class="btn" (click)="onCancel(true)">{{ action.buttons.cancel || 'yuv.framework.shared.cancel' | translate }}</button>
      <button class="btn primary" (click)="onFinish(true)">{{ action.buttons.finish || 'yuv.framework.shared.change' | translate }}</button>
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
  static EVENT_CANCEL = 'yuv.plugin.action.cancel';
  static EVENT_FINISH = 'yuv.plugin.action.finish';
  static EVENT_CANCELED = 'yuv.plugin.action.canceled';
  static EVENT_FINISHED = 'yuv.plugin.action.finished';

  @Input() parent: any;

  @Input() action: any;

  @Input() selection: any[];

  @Output() finished: EventEmitter<any> = new EventEmitter<any>();

  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(private pluginsService: PluginsService) {
    this.pluginsService.api.events.on(PluginActionViewComponent.EVENT_CANCEL).subscribe(() => this.onCancel());
    this.pluginsService.api.events.on(PluginActionViewComponent.EVENT_FINISH).subscribe(() => this.onFinish());
  }

  onCancel(trigger = false) {
    trigger && this.pluginsService.api.events.trigger(PluginActionViewComponent.EVENT_CANCELED);
    this.canceled.emit(true);
  }

  onFinish(trigger = false) {
    trigger && this.pluginsService.api.events.trigger(PluginActionViewComponent.EVENT_FINISHED);
    this.finished.emit(true);
  }
}
