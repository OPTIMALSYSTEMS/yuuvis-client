import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  AggregateResult,
  AppCacheService,
  BaseObjectTypeField,
  ColumnConfigSkipFields,
  ContentStreamField,
  ObjectType,
  ObjectTypeClassification,
  ObjectTypeField,
  ObjectTypeGroup,
  SearchFilter,
  SearchFilterGroup,
  SearchQuery,
  SearchService,
  SecondaryObjectTypeClassification,
  SystemService,
  TranslateService,
  UserService,
  Utils
} from '@yuuvis/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DynamicDate } from '../../form/elements/datetime/datepicker/datepicker.interface';
import { DatepickerService } from '../../form/elements/datetime/datepicker/service/datepicker.service';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { FileSizePipe } from '../../pipes/filesize.pipe';

/**
 * Use QuickSearchService to provide `filter opportunity` for target object types.
 */
@Injectable({
  providedIn: 'root'
})
export class QuickSearchService {
  private STORAGE_KEY_FILTERS_VISIBILITY = 'yuv.framework.search.filters.visibility';
  private STORAGE_KEY_FILTERS_LAST = 'yuv.framework.search.filters.last';
  private STORAGE_KEY_FILTERS = 'yuv.framework.search.filters';

  private filters = {};
  private globalFilters = {};
  private filtersVisibility: { hidden: string[]; __visible: string[]; __hidden: string[] };
  private filtersLast = [];
  private get filtersHidden() {
    return this.filtersVisibility
      ? [...this.filtersVisibility.hidden, ...this.filtersVisibility.__hidden.filter((id) => !this.filtersVisibility.__visible.includes(id))]
      : [];
  }

  availableObjectTypes: Selectable[] = [];
  availableObjectTypeGroups: SelectableGroup[] = [];

  // object types that one should not search for
  skipTypes = [];

  private isDefaultFilter = (id: string) => id.startsWith('__');
  private _filters = (global = false) => (!global ? this.filters : this.globalFilters);

  /**
   *
   * @ignore
   */
  constructor(
    public translate: TranslateService,
    private systemService: SystemService,
    private datepickerService: DatepickerService,
    private appCacheService: AppCacheService,
    private userService: UserService,
    private searchService: SearchService
  ) {
    // this.saveFilters(true, {});
    // this.saveFilters(false, {});

    this.systemService.system$.subscribe(() => this.setupAvailableObjectTypes() && this.setupAvailableObjectTypeGroups());
  }

  private setupAvailableObjectTypeGroups() {
    let i = 0;
    const extendable = this.systemService.getAllExtendableSOTs().map((o) => o.id);
    return (this.availableObjectTypeGroups = this.systemService.getGroupedObjectTypes(true, true, true, 'search').map((otg: ObjectTypeGroup) => ({
      id: `${i++}`,
      label: otg.label,
      items: otg.types.map((ot: ObjectType) => ({
        id: ot.id,
        label: ot.label || ot.id,
        highlight: ot.isFolder,
        svgSrc: this.systemService.getObjectTypeIconUri(ot.id),
        value: ot,
        class: extendable.includes(ot.id) && 'extension'
      }))
    })));
  }

  private setupAvailableObjectTypes() {
    // also add extension types that are not excluded from search
    const extendables = this.systemService
      .getSecondaryObjectTypes()
      .filter(
        (sot) =>
          !sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED) &&
          !sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY) &&
          !sot.classification?.includes(ObjectTypeClassification.SEARCH_FALSE)
      );

    return (this.availableObjectTypes = [...this.systemService.getObjectTypes(false, 'search'), ...extendables]
      .filter((t) => !this.skipTypes.includes(t.id))
      .map((ot) => ({
        id: ot.id,
        label: this.systemService.getLocalizedResource(`${ot.id}_label`) || ot.id,
        value: ot
      }))
      .sort(Utils.sortValues('label')));
  }

  loadFilterSettings(global = false) {
    return forkJoin([this.loadStoredFilters(null, global), this.loadHiddenFilters(global), this.loadLastFilters()]);
  }

  getCurrentSettings(global = false) {
    return forkJoin([this.loadStoredFilters(of(this._filters(global)), global), of([...this.filtersHidden]), of([...this.filtersLast])]);
  }

  getAvailableFilterGroups(storedFilters: Selectable[], availableObjectTypeFields: Selectable[]) {
    const groups = storedFilters.reduce((prev, cur) => {
      SearchFilterGroup.fromArray(cur.value).filters.forEach((f) => (prev[f.property] = (prev[f.property] || []).concat([cur])));
      return prev;
    }, {});
    return Object.keys(groups).map((key) => ({ id: key, label: availableObjectTypeFields.find((f) => f.id === key).label, items: groups[key] }));
  }

  getActiveTypes(query: SearchQuery, aggregations = [BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]) {
    return this.searchService.aggregate(query, aggregations).pipe(
      map((res: AggregateResult) => {
        return (
          (res.aggregations?.length && res.aggregations[0].entries.length && res.aggregations[0].entries) ||
          query.allTypes.map((key) => ({ key, count: 0 }))
        )
          .map((r) => ({ id: r.key, label: this.systemService.getLocalizedResource(`${r.key}_label`) || r.key, count: r.count }))
          .sort(Utils.sortValues('label'));
      })
    );
  }

  getActiveExtensions(query: SearchQuery) {
    return {
      active: query.types || [],
      all: this.systemService
        .getAllExtendableSOTs(true)
        .map((o) => ({ id: o.id, label: o.label || o.id, count: 0 }))
        .filter((o) => (query.types || []).includes(o.id))
        .sort(Utils.sortValues('label'))
    };
  }

  private getSharedFields(selectedTypes = [], shared = true): ObjectTypeField[] {
    const selectedObjectTypes = selectedTypes.map((id) => this.systemService.getResolvedType(id));

    return shared
      ? selectedObjectTypes.reduce((prev, cur) => cur.fields.filter((f) => prev.find((p) => p.id === f.id)), [...selectedObjectTypes[0].fields])
      : selectedObjectTypes.reduce((prev, cur) => [...prev, ...cur.fields.filter((f) => !prev.find((p) => p.id === f.id))], []);
  }

  getAvailableObjectTypesFields(selectedTypes = [], shared = true): Selectable[] {
    const q = new SearchQuery();
    this.updateTypesAndLots(q, selectedTypes);

    const allTypes = q.allTypes.length ? q.allTypes : this.availableObjectTypeGroups?.reduce((p, c) => [...p, ...c.items.map((t) => t.id)], []) || [];

    const sharedFields = [
      ...this.getSharedFields(allTypes, shared)
        .reduce((m, item) => (m.has(item.id) || m.set(item.id, item)) && m, new Map())
        .values()
    ];

    const toSelectable = (f: ObjectTypeField) => ({
      id: f.id,
      label: this.systemService.getLocalizedResource(`${f.id}_label`) || f.id,
      value: f,
      highlight: this.systemService.isSystemProperty(f)
    });

    const skipFields = [BaseObjectTypeField.TAGS, BaseObjectTypeField.LEADING_OBJECT_TYPE_ID, ...ColumnConfigSkipFields];
    const fields = [...sharedFields.filter((f) => !skipFields.includes(f.id)).map((f) => toSelectable(f))].sort(Utils.sortValues('label'));

    const tags = allTypes.reduce(
      (prev, cur) => this.systemService.getResolvedTags(cur).filter((t) => prev.find((p) => p.tagName === t.tagName)),
      this.systemService.getResolvedTags(allTypes[0])
    );

    return [
      ...fields.filter((f) => f.value.propertyType !== 'table'),

      ...fields
        .filter((f) => f.value.propertyType === 'table')
        .reduce(
          (p, c: any) => [
            ...p,
            ...c.value.columnDefinitions
              .map((f) => toSelectable(f))
              .map((f) => {
                // TODO : should we remove namespace from column ID???
                const id = c.id + `[*].` + f.id.replace(/.*:/, '');
                const label = '☷ ' + c.label + ' - ' + f.label;
                return { ...f, id, label, value: { ...f.value, id } };
              })
          ],
          []
        ),
      ...tags.reduce(
        (p, c: any) => [
          ...p,
          ...c.fields[0].columnDefinitions
            .filter((f) => f.id.match(/state/))
            .map((value) => {
              const id = BaseObjectTypeField.TAGS + `[${c.tagName}].state`;
              const label = this.getLocalizedTag(id);
              return { id, label, class: id, defaultValue: c.tagValues, defaultOperator: SearchFilter.OPERATOR.IN, value: { ...value, id } };
            })
        ],
        []
      )
    ].sort(Utils.sortValues('label'));
  }

  updateTypesAndLots(query: SearchQuery, allTypes: string[], keep = false) {
    const { types, lots } = this.systemService.resolveTypesLots(allTypes || []);
    query.types = keep ? query.types : types;
    query.lots = lots;
  }

  getActiveFilters(query: SearchQuery, filters: Selectable[], availableObjectTypeFields: Selectable[]) {
    return (query.filterGroup.operator === SearchFilterGroup.OPERATOR.AND ? query.filterGroup.group : [query.filterGroup])
      .reduce((prev, cur) => {
        const g = SearchFilterGroup.fromArray([cur]);
        // spread groups (only AND) that have filters with same property
        return [
          ...prev,
          ...(g.operator === SearchFilterGroup.OPERATOR.AND && g.group.every((f) => f.property === g.filters[0].property)
            ? g.group.map((f) => SearchFilterGroup.fromArray([f]))
            : [g])
        ];
      }, [])
      .filter((g) => !g.filters.find((f) => ColumnConfigSkipFields.includes(f.property)))
      .map((g) => {
        return (
          filters.find((sf) => SearchFilterGroup.fromArray(sf.value).toString() === g.toString()) || {
            id: '#' + Utils.uuid(),
            highlight: true,
            label: `* ${g.filters
              .map((f: SearchFilter) => {
                if (f.property?.match(/state/) && f.operator === SearchFilter.OPERATOR.EQUAL) return this.getLocalizedTag(f.property, f.firstValue);
                const otf = availableObjectTypeFields.find((s) => s.id === f.property);
                return otf?.label || '?';
              })
              .join(` ${SearchFilterGroup.OPERATOR_LABEL[g.operator]}\n`)} *`,
            value: [g]
          }
        );
      });
  }

  loadLastFilters() {
    return this.appCacheService.getItem(this.STORAGE_KEY_FILTERS_LAST).pipe(tap((f) => (this.filtersLast = f || [])));
  }

  loadHiddenFilters(global = false) {
    return forkJoin([
      this.userService.getGlobalSettings(this.STORAGE_KEY_FILTERS_VISIBILITY),
      this.userService.getSettings(this.STORAGE_KEY_FILTERS_VISIBILITY)
    ]).pipe(
      map(
        ([globalSettings, settings]) =>
          (this.filtersVisibility = {
            hidden: (settings || {}).hidden || [],
            __visible: (settings || {}).__visible || [],
            __hidden: (globalSettings || {}).__hidden || []
          })
      ),
      map((f: any) => (global ? [...this.filtersVisibility.__hidden] : this.filtersHidden))
    );
  }

  loadStoredFilters(store?: Observable<any>, global = false) {
    return (global ? of({}) : store || this.userService.getSettings(this.STORAGE_KEY_FILTERS)).pipe(
      tap((filters) => !global && Object.values(filters || {}).map((v: any) => (v.id = v.id.replace(/^__/, '')))),
      tap((filters) => !global && (this.filters = filters || {})),
      switchMap(() => (global && store) || this.userService.getGlobalSettings(this.STORAGE_KEY_FILTERS)),
      tap((filters) => Object.values(filters || {}).map((v: any) => (v.id = (global ? '' : '__') + v.id.replace(/^__/, '')))),
      tap((filters) => (this.globalFilters = filters || {})),
      map((filters) =>
        Object.values({ ...(filters || {}), ...(!global ? this.filters : {}) }).map((s: any) => ({
          ...s,
          value: [SearchFilterGroup.fromQuery(this.parseStoredFilters(s.value))]
        }))
      )
    );
  }

  private parseStoredFilters(filters: string): any {
    let res = {};
    try {
      res = filters ? JSON.parse(filters) : {};
    } catch (e) {
      console.error(e);
    }
    return res;
  }

  loadFilters(storedFilters: Selectable[], availableObjectTypeFields: Selectable[]) {
    const available = availableObjectTypeFields.map((a) => a.id);
    return [...storedFilters.filter((v: Selectable) => this.isMatching(v, available)), ...this.getDefaultFiltersList(availableObjectTypeFields)]
      .map((f) => ({ ...f, highlight: !this.isDefaultFilter(f.id) }))
      .sort((a, b) => (a.id.replace(/#.*/, '') === b.id.replace(/#.*/, '') ? 0 : Utils.sortValues('label').call(this, a, b)));
  }

  private isMatching(v: Selectable, available: string[]) {
    const fg = SearchFilterGroup.fromArray(v.value);
    if (fg.operator === SearchFilterGroup.OPERATOR.AND) {
      return fg.filters.map((v) => v.property).every((p) => available.includes(p));
    } else {
      return fg.group.some((f) => this.isMatching({ ...v, value: [f] }, available));
    }
  }

  saveLastFilters(ids: string[]) {
    // persist last 20 filters
    this.filtersLast = [...ids].concat(this.filtersLast.filter((f) => !ids.includes(f))).slice(0, 20);
    this.filtersLast.length && this.appCacheService.setItem(this.STORAGE_KEY_FILTERS_LAST, this.filtersLast).subscribe();
    return of(this.filtersLast);
  }

  saveFiltersVisibility(id: string, visible: boolean, global = false) {
    let { hidden, __visible, __hidden } = this.filtersVisibility;

    if (global) {
      this.filtersVisibility.__hidden = __hidden = __hidden.filter((i) => i !== id).concat(!visible ? [id] : []);
      this.userService.saveGlobalSettings(this.STORAGE_KEY_FILTERS_VISIBILITY, { __hidden }).subscribe();
      return of([...__hidden]);
    }

    if (visible && __hidden.includes(id)) {
      __visible.push(id);
    } else {
      this.filtersVisibility.hidden = hidden = hidden.filter((i) => i !== id).concat(!visible ? [id] : []);
      this.filtersVisibility.__visible = __visible = __visible.filter((i) => i !== id);
    }
    this.userService.saveSettings(this.STORAGE_KEY_FILTERS_VISIBILITY, { hidden, __visible }).subscribe();
    return of(this.filtersHidden);
  }

  saveFilters(global = false, filters?: any) {
    filters = filters || this._filters(global);
    global
      ? this.userService.saveGlobalSettings(this.STORAGE_KEY_FILTERS, filters).subscribe()
      : this.userService.saveSettings(this.STORAGE_KEY_FILTERS, filters).subscribe();
    return this.loadStoredFilters(of(filters), global);
  }

  saveFilter(item: Selectable, global = false) {
    this._filters(global)[item.id] = { ...item, value: SearchFilterGroup.fromArray(item.value).toShortString() };
    return this.saveFilters(global);
  }

  removeFilter(item: Selectable, global = false) {
    delete this._filters(global)[item.id];
    return this.saveFilters(global);
  }

  groupFilters(filters: Selectable[]): SelectableGroup[] {
    const table = /[.*].*/;
    const tableID = (id) => id.replace(table, '');
    return [
      {
        id: 'available',
        label: this.translate.instant('yuv.framework.search.filter.available.fields'),
        items: filters.filter((f) => !f.id.match(table))
      },
      ...[
        ...filters
          .filter((f) => f.id.match(table))
          .reduce((p, c) => p.set(tableID(c.id), [...(p.get(tableID(c.id)) || []), c]) && p, new Map())
          .values()
      ].map((items) => ({
        id: items[0].id,
        label: items[0].label.replace(/\s-.*/, ''),
        collapsed: true,
        items: !items[0].id.startsWith(BaseObjectTypeField.TAGS)
          ? items
          : [
              {
                ...items[0],
                value: [new SearchFilter(items[0].value[0].property, SearchFilter.OPERATOR.LESS_OR_EQUAL, items[0].defaultValue.slice(-1)[0])]
              },
              ...items[0].defaultValue.map((v) => ({
                id: `${items[0].id}_${v}`,
                label: this.getLocalizedTag(items[0].id, v),
                value: [new SearchFilter(items[0].id, SearchFilter.OPERATOR.EQUAL, v)]
              }))
            ]
      }))
    ];
  }

  getLocalizedTag(id: string, val?: number) {
    const name = id.replace(/.*\[/, '').replace(/\].*/, '');
    const label = '#' + (this.systemService.getLocalizedResource(`${name}_label`) || name);
    return val === undefined ? label : `${this.systemService.getLocalizedResource(`${name}:${val}_label`) || val} ( ${label} )`;
  }

  getDefaultFiltersList(availableObjectTypeFields: Selectable[]) {
    return this.getDefaultFilters(availableObjectTypeFields).reduce((prev, cur) => {
      cur.items.forEach((i) => (i.label = `${cur.label} ( ${i.label} )`));
      return [...prev, ...cur.items];
    }, []);
  }

  getDefaultFilters(availableObjectTypeFields: Selectable[]) {
    const filesizePipe = new FileSizePipe(this.translate);
    const key = 'yuv.framework.search.agg.time.';
    const timeRange: DynamicDate[] = ['today', 'yesterday', 'thisweek', 'thismonth', 'thisyear'];
    const timeRangeDates: any[] = timeRange.map((range) => {
      const from = this.datepickerService.getDateFromType(range, getLocaleFirstDayOfWeek(this.translate.currentLang));
      const to =
        range === 'thisyear' || range === 'thismonth'
          ? new Date(from).setMonth(range === 'thismonth' ? new Date(from).getMonth() + 1 : 12) - 1
          : new Date(from).setHours(24 * (range === 'thisweek' ? 7 : 1)) - 1;
      return { from: new Date(from).toISOString(), to: new Date(to).toISOString(), range };
    });

    const CREATION_DATE = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.CREATION_DATE);
    const MODIFICATION_DATE = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.MODIFICATION_DATE);
    const MIME_TYPE = availableObjectTypeFields.find((s) => s.id === ContentStreamField.MIME_TYPE);
    const LENGTH = availableObjectTypeFields.find((s) => s.id === ContentStreamField.LENGTH);
    const CREATED_BY = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.CREATED_BY);
    const MODIFIED_BY = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.MODIFIED_BY);

    return [
      CREATION_DATE && {
        id: 'created',
        label: CREATION_DATE.label,
        items: timeRangeDates.map(({ from, to, range }) => ({
          id: '__' + CREATION_DATE.id + '#' + range,
          label: this.translate.instant(key + range),
          value: [new SearchFilter(CREATION_DATE.id, SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH, from, to)]
        }))
      },
      MODIFICATION_DATE && {
        id: 'modified',
        label: MODIFICATION_DATE.label,
        items: timeRangeDates.map(({ from, to, range }) => ({
          id: '__' + MODIFICATION_DATE.id + '#' + range,
          label: this.translate.instant(key + range),
          value: [new SearchFilter(MODIFICATION_DATE.id, SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH, from, to)]
        }))
      },
      MIME_TYPE && {
        id: 'mime',
        label: MIME_TYPE.label,
        items: ['*word*', '*pdf*', '*image*', '*audio*', '*video*', '*excel*', '*mail*', '*text*', '*powerpoint*'].sort().map((r) => ({
          id: '__' + MIME_TYPE.id + '#' + r,
          label: r.replace(/\*/g, ''),
          value: [
            new SearchFilter(MIME_TYPE.id, SearchFilter.OPERATOR.IN, r === '*excel*' ? [r, '*spreadsheet*'] : r === '*powerpoint*' ? [r, '*presentation*'] : r === '*mail*' ? ['*message*', '*outlook*'] : [r])
          ]
        }))
      },
      LENGTH && {
        id: 'size',
        label: LENGTH.label,
        items: ['0 MB - 1 MB', '1 MB - 10 MB', '10 MB - 100 MB', '100 MB - 10000 MB'].map((r) => ({
          id: '__' + LENGTH.id + '#' + r,
          label: r,
          value: [
            new SearchFilter(
              LENGTH.id,
              SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH,
              filesizePipe.stringToNumber(r.split(' - ')[0]),
              filesizePipe.stringToNumber(r.split(' - ')[1])
            )
          ]
        }))
      },
      CREATED_BY && {
        id: 'created_by',
        label: CREATED_BY.label,
        items: [
          {
            id: '__' + CREATED_BY.id + '#' + 'ME',
            label: this.userService.getCurrentUser().getFullName(),
            value: [new SearchFilter(CREATED_BY.id, SearchFilter.OPERATOR.EQUAL, this.userService.getCurrentUser().id)]
          }
        ]
      },
      MODIFIED_BY && {
        id: 'modified_by',
        label: MODIFIED_BY.label,
        items: [
          {
            id: '__' + MODIFIED_BY.id + '#' + 'ME',
            label: this.userService.getCurrentUser().getFullName(),
            value: [new SearchFilter(MODIFIED_BY.id, SearchFilter.OPERATOR.EQUAL, this.userService.getCurrentUser().id)]
          }
        ]
      }
    ].filter((v) => v);
  }
}
