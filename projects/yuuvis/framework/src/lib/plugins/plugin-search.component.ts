import { Component, Input } from '@angular/core';
import { ApiBase, SearchFilter, SearchFilterGroup, SearchQuery } from '@yuuvis/core';
import { Selectable, SelectableGroup } from '../grouped-select';
import { PluginExtensionConfig } from './plugins.interface';
import { PluginsService } from './plugins.service';

type Inputs = { init?: string | Function; query?: any; array?: any[]; skipCount?: boolean; maxHeight?: number; hideZeroCount?: boolean; skipTranslate?: boolean; operator?: 'AND' | 'OR' };

@Component({
  selector: 'yuv-plugin-search',
  template: ``,
  styles: []
})
export class PluginSearchComponent {
  static parseExtensions(plugins: any[], parent: any, pluginService: PluginsService) {
    return plugins.reduce((p, c) => {
      const ext = new PluginSearchComponent(pluginService).init(c, parent);
      return [...p, ...(Array.isArray(ext) ? ext : [ext])];
    }, []).filter((g: any) => g);
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

  get maxHeight() {
    return this.inputs.maxHeight || undefined;
  }

  get hideZeroCount() {
    return this.inputs.hideZeroCount || false;
  }

  constructor(private pluginService: PluginsService) {}

  init(extension: PluginExtensionConfig, parent: any): Selectable | SelectableGroup | SelectableGroup[] {
    this.extension = extension;
    this.parent = parent;
    return (this.selectable = !this.inputs.init
      ? this.toSelectable()
      : this.pluginService.applyFunction(this.inputs.init, 'component, parent, PluginSearchComponent, SearchFilterGroup, SearchFilter, SearchQuery', [
          this,
          this.parent,
          PluginSearchComponent,
          SearchFilterGroup,
          SearchFilter,
          SearchQuery
        ]));
  }

  findAvailableField(id: string) {
    return this.parent.availableObjectTypeFields.find((f) => f.id === id);
  }

  getAvailableCatalogs() {
    return this.parent.availableObjectTypeFields.filter((f) => f.value?._internalType?.match('string:catalog'));
  }

  getClassifications(field: any) {
    return field && this.pluginService['systemService'].getClassifications(field.value?.classifications);
  }

  catalogToSelectableGroup(id: string, options?: string[] | { value: string; label: string }[] | Promise<any[]>): SelectableGroup {
    const field = this.findAvailableField(id);
    const classifications = !options && this.getClassifications(field);
    const opts = options || classifications?.get('catalog')?.options || this.loadCatalogOptions(classifications?.get('dynamic:catalog')?.options[0]);
    
    const items = (opts instanceof Promise ? [] : opts)
      ?.map((o: any) => (typeof o === 'string' ? { value: o, label: o } : o))
      .map(({ value, label }) =>
        this.toSelectable({ id: id + '__' + value, label }, { operator: 'OR', array: [new SearchFilter(id, SearchFilter.OPERATOR.EQUAL, value)] }, true)
      );

    const group = field && items && { id, label: field.label || '', items, maxHeight: this.maxHeight, hideZeroCount: this.hideZeroCount, aggregations: [id] };

    if (group && opts instanceof Promise) {
      opts.then((o: any[]) => {
        group.items = this.catalogToSelectableGroup(id, o).items || [];
        this.parent.aggregate(true, [id]);
      });
    }
    
    return group;
  }

  loadCatalogOptions(id: string) : Promise<string[]> {
    return id && window['api'].http.get('/dms/catalogs/' + id, ApiBase.apiWeb)
      .then((res: any) => res?.data?.entries?.filter((o: any) => !o.disabled).map((o: any) => o.name) || []);
  }

  toSelectable(o: any = this.extension, inputs = this.inputs, skipTranslate = this.skipTranslate, skipCount = this.skipCount): Selectable {
    const group = inputs.query ? SearchFilterGroup.fromQuery(inputs.query) : inputs.array ? SearchFilterGroup.fromArray(inputs.array) : '';
    return (
      group && {
        id: o.id,
        label: !skipTranslate && o.label ? this.pluginService.translate.instant(o.label) : o.label || o.id,
        value: new SearchFilterGroup(
          inputs.operator === 'OR' ? o.id.replace(/__.*/, '') : o.id,
          inputs.operator === 'OR' ? SearchFilterGroup.OPERATOR.OR : SearchFilterGroup.OPERATOR.AND,
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
