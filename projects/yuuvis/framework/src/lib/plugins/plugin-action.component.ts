import { Component, Input } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { ActionTarget } from '../actions/action-target';
import { SimpleCustomAction } from '../actions/interfaces/action.interface';
import { SelectionRange } from '../actions/selection-range.enum';
import { noFile } from '../svg.generated';
import { PluginActionViewComponent } from './plugin-action-view.component';
import { PluginsService } from './plugins.service';

@Component({
  selector: 'yuv-plugin-action',
  template: ''
})
export class PluginActionComponent implements SimpleCustomAction {
  static actionWrapper(actions: any[]) {
    const map = (actions || []).map((a) => ({ ...a, target: a.target || ActionTarget.DMS_OBJECT, action: a, _component: PluginActionComponent }));
    return map;
  }

  label: string;
  description: string;
  priority: number;
  iconSrc: string;
  group: 'common' | 'further';
  range: SelectionRange;

  private _action: any;

  @Input() set action(action: any) {
    this._action = action;
    this.label = this.pluginService.translate.instant(this._action.label);
    this.description = this.pluginService.translate.instant(this._action.description);
    this.priority = Utils.isEmpty(action.priority) ? action.priority : -1;
    this.iconSrc = action.icon || noFile.data;
    this.group = action.group || 'common';
    this.range = action.range ? SelectionRange[action.range as string] : SelectionRange.MULTI_SELECT;
    if (action.getLink) {
      ['getLink', 'getParams', 'getFragment'].forEach(
        (fnc) => (this[fnc] = (selection: any[]) => this.pluginService.applyFunction(action[fnc], 'selection', [selection]))
      );
    } else if (action.plugin && action.fullscreen) {
      this['extComponent'] = { action, _component: PluginActionViewComponent };
    } else if (action.plugin) {
      this['component'] = { action, _component: PluginActionViewComponent };
    } else if (action.subActionComponents) {
      this['subActionComponents'] = PluginActionComponent.actionWrapper(action.subActionComponents);
    }
  }

  constructor(private pluginService: PluginsService) {}

  isExecutable(item: any) {
    const val = this.pluginService.applyFunction(this._action.isExecutable, 'item', arguments);
    return val instanceof Observable ? val : of(val);
  }

  run(selection: any[]) {
    const val = this.pluginService.applyFunction(this._action.run, 'selection', arguments);
    return val instanceof Observable ? val : of(val);
  }
}
