import { Component, Input } from '@angular/core';
import { SearchFilter, SearchFilterGroup } from '@yuuvis/core';
import { Selectable, SelectableGroup } from '../grouped-select';
import { PluginExtensionConfig } from './plugins.interface';
import { PluginsService } from './plugins.service';

type Inputs = { init?: string | Function; query?: any; array?: any[]; skipCount?: boolean; skipTranslate?: boolean; operator?: 'AND' | 'OR' };

@Component({
  selector: 'yuv-plugin-search',
  template: ``,
  styles: []
})
export class PluginSearchComponent {
  static parseExtensions(plugins: any[], parent: any, pluginService: PluginsService) {
    return plugins.map((p) => new PluginSearchComponent(pluginService).init(p, parent)).filter((g) => g);
  }

  @Input() parent: any;
  @Input() extension: PluginExtensionConfig;

  private selectable: SelectableGroup | Selectable;

  get inputs(): Inputs {
    return this.extension?.plugin?.inputs || {};
  }

  get skipCount() {
    return this.inputs.skipCount || false;
  }

  get skipTranslate() {
    return this.inputs.skipTranslate || false;
  }

  constructor(private pluginService: PluginsService) {}

  init(extension: PluginExtensionConfig, parent: any): Selectable | SelectableGroup {
    this.extension = extension;
    this.parent = parent;
    return (this.selectable = !this.inputs.init
      ? this.toSelectable()
      : this.pluginService.applyFunction(this.inputs.init, 'component, parent, SearchFilterGroup, SearchFilter', [
          this,
          this.parent,
          SearchFilterGroup,
          SearchFilter
        ]));
  }

  catalogToSelectableGroup(id: string, options?: string[] | { value: string; label: string }[]): SelectableGroup {
    const field = this.parent.availableObjectTypeFields.find((f) => f.id === id);
    const opts = field && !options ? this.pluginService['systemService'].getClassifications(field.value?.classifications)?.get('catalog')?.options : options;
    const items = opts
      ?.map((o: any) => (typeof o === 'string' ? { value: o, label: o } : o))
      .map(({ value, label }) =>
        this.toSelectable({ id: id + '__' + value, label }, { operator: 'OR', array: [new SearchFilter(id, SearchFilter.OPERATOR.EQUAL, value)] }, true)
      );
    return items && { id, label: field.label, items };
  }

  toSelectable(o: any = this.extension, inputs = this.inputs, skipTranslate = this.skipTranslate, skipCount = this.skipCount): Selectable {
    const group = inputs.query ? SearchFilterGroup.fromQuery(inputs.query) : inputs.array ? SearchFilterGroup.fromArray(inputs.array) : '';
    return (
      group && {
        id: o.id,
        label: !skipTranslate && o.label ? this.pluginService.translate.instant(o.label) : o.label || o.id,
        value: new SearchFilterGroup(
          inputs.operator === 'OR' ? o.id.replace(/__.*/, '') : o.id,
          inputs.operator === 'OR' ? inputs.operator : SearchFilterGroup.OPERATOR.AND,
          [group]
        ),
        class: skipCount ? 'skipCount' : '',
        count: 0
      }
    );
  }

  toSelectableGroup(o: any = this.extension, inputs = this.inputs, skipTranslate = this.skipTranslate, skipCount = this.skipCount): SelectableGroup {
    const selectable = this.toSelectable(o, inputs, skipTranslate, skipCount);
    return selectable && { id: o.id, label: !skipTranslate && o.label ? this.pluginService.translate.instant(o.label) : o.label || o.id, items: [selectable] };
  }
}
