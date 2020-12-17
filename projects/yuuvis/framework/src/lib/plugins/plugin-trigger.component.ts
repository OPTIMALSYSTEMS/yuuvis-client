import { Component, HostBinding, Input, TemplateRef, ViewChild } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { SimpleCustomAction } from '../actions/interfaces/action.interface';
import { SelectionRange } from '../actions/selection-range.enum';
import { PopoverConfig } from '../popover/popover.interface';
import { PopoverService } from '../popover/popover.service';
import { noFile } from '../svg.generated';
import { PluginsService } from './plugins.service';

@Component({
  selector: 'yuv-plugin-trigger',
  template: `
    <yuv-icon [hidden]="!(isExecutable() | async)" [svg]="action.icon" (click)="run()" title="{{ action.label | translate }}"></yuv-icon>
    <ng-template #popoverRef let-data let-popover="popover">
      <yuv-plugin-action-view
        *ngIf="data.component.action?.plugin"
        [action]="data.component.action"
        [parent]="data.component.parent || data.component"
        (finished)="popover?.close()"
        (canceled)="popover?.close()"
      ></yuv-plugin-action-view>
    </ng-template>
  `,
  styles: [
    `
      yuv-icon {
        height: 16px;
        width: 16px;
        cursor: pointer;
      }
    `
  ]
})
export class PluginTriggerComponent implements SimpleCustomAction {
  @HostBinding('style.display') display: 'flex' | 'none' = 'flex';
  @ViewChild('popoverRef') popoverRef: TemplateRef<any>;

  @Input() parent: any;

  label: string;
  description: string;
  priority: number;
  iconSvg: string;
  group: 'visible' | 'hidden';
  range: SelectionRange = SelectionRange.SINGLE_SELECT;

  private _action: any;

  @Input() set action(action: any) {
    this._action = action;
    this.label = action.label;
    this.description = action.description || action.label;
    this.priority = Utils.isEmpty(action.priority) ? action.priority : -1;
    this.iconSvg = action.icon || noFile.data;
    this.group = action.group || 'hidden';
  }

  get action() {
    return this._action;
  }

  constructor(private pluginService: PluginsService, private popoverService: PopoverService) {}

  isExecutable(item: any = this.action) {
    const val = this.pluginService.applyFunction(this.action.isExecutable, 'component', [this]);
    this.display = val ? 'flex' : 'none';
    return val instanceof Observable ? val : of(val);
  }

  run(selection: any[] = [this.action]) {
    const val = this.action?.run ? this.pluginService.applyFunction(this.action.run, 'component', [this]) : this.openPopover();
    return val instanceof Observable ? val : of(val);
  }

  openPopover() {
    const popoverConfig: PopoverConfig = {
      disableSmallScreenClose: true,
      ...(this.action?.plugin?.popoverConfig || {}),
      data: {
        component: this
      }
    };
    return this.action?.plugin ? this.popoverService.open(this.popoverRef, popoverConfig) : false;
  }
}
