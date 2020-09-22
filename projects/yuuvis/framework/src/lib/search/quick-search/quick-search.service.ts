import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  AggregateResult,
  AppCacheService,
  BaseObjectTypeField,
  ColumnConfigSkipFields,
  ContentStreamField,
  ObjectType,
  ObjectTypeGroup,
  SearchFilter,
  SearchFilterGroup,
  SearchQuery,
  SearchService,
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
  private filtersVisibility: { hidden: string[]; __visible: string[]; __hidden: string[] };
  private filtersLast = [];
  private get filtersHidden() {
    return [...this.filtersVisibility.hidden, ...this.filtersVisibility.__hidden.filter((id) => !this.filtersVisibility.__visible.includes(id))];
  }

  availableObjectTypes: Selectable[] = [];
  availableObjectTypeGroups: SelectableGroup[] = [];

  // object types that one should not search for
  skipTypes = [];

  private isDefaultFilter = (id: string) => id.startsWith('__');

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
    this.systemService.system$.subscribe((_) => {
      this.availableObjectTypes = this.systemService
        .getObjectTypes()
        .filter((t) => !this.skipTypes.includes(t.id))
        .map((ot) => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`) || ot.id,
          value: ot
        }))
        .sort(Utils.sortValues('label'));
      let i = 0;
      this.availableObjectTypeGroups = this.systemService.getGroupedObjectTypes(true, true, true, 'search').map((otg: ObjectTypeGroup) => ({
        id: `${i++}`,
        label: otg.label,
        items: otg.types.map((ot: ObjectType) => ({
          id: ot.id,
          label: ot.label || ot.id,
          highlight: ot.isFolder,
          svgSrc: this.systemService.getObjectTypeIconUri(ot.id),
          value: ot
        }))
      }));
    });
  }

  loadFilterSettings(global = false) {
    return forkJoin([this.loadStoredFilters(null, global), this.loadHiddenFilters(global), this.loadLastFilters()]);
  }

  getCurrentSettings(global = false) {
    return forkJoin([this.loadStoredFilters(of(this.filters), global), of([...this.filtersHidden]), of([...this.filtersLast])]);
  }

  getAvailableFilterGroups(storedFilters: Selectable[], availableObjectTypeFields: Selectable[]) {
    const groups = storedFilters.reduce((prev, cur) => {
      SearchFilterGroup.fromArray(cur.value).filters.forEach((f) => (prev[f.property] = (prev[f.property] || []).concat([cur])));
      return prev;
    }, {});
    return Object.keys(groups).map((key) => ({ id: key, label: availableObjectTypeFields.find((f) => f.id === key).label, items: groups[key] }));
  }

  getActiveTypes(query: SearchQuery) {
    return this.searchService.aggregate(query, [BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]).pipe(
      map((res: AggregateResult) => {
        return res.aggregations && res.aggregations.length
          ? res.aggregations[0].entries
              .map((r) => ({ id: r.key, label: this.systemService.getLocalizedResource(`${r.key}_label`) || r.key, count: r.count }))
              .sort(Utils.sortValues('label'))
          : [];
      })
    );
  }

  getAvailableObjectTypesFields(selectedTypes = [], shared = true): Selectable[] {
    const selectedObjectTypes = (selectedTypes && selectedTypes.length
      ? selectedTypes
      : !shared
      ? [...this.systemService.getObjectTypes(), ...this.systemService.getSecondaryObjectTypes()].map((t) => t.id)
      : [undefined]
    ).map((id) => this.systemService.getResolvedType(id));

    const sharedFields = shared
      ? selectedObjectTypes.reduce((prev, cur) => cur.fields.filter((f) => prev.find((p) => p.id === f.id)), selectedObjectTypes[0].fields)
      : selectedObjectTypes.reduce((prev, cur) => [...prev, ...cur.fields.filter((f) => !prev.find((p) => p.id === f.id))], []);

    return sharedFields
      .filter((f) => !ColumnConfigSkipFields.includes(f.id))
      .map((f) => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`) || f.id,
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  getActiveFilters(query: SearchQuery, filters: Selectable[], availableObjectTypeFields: Selectable[]) {
    return (query.filterGroup.operator === SearchFilterGroup.OPERATOR.AND ? query.filterGroup.group : [query.filterGroup])
      .reduce((prev, cur) => {
        const g = SearchFilterGroup.fromArray([cur]);
        // spread groups that have filters with same property
        return [...prev, ...(g.group.every((f) => f.property === g.filters[0].property) ? g.group.map((f) => SearchFilterGroup.fromArray([f])) : [g])];
      }, [])
      .filter((g) => !g.filters.find((f) => ColumnConfigSkipFields.includes(f.property)))
      .map((g) => {
        return (
          filters.find((sf) => SearchFilterGroup.fromArray(sf.value).toString() === g.toString()) || {
            id: '#' + Utils.uuid(),
            highlight: true,
            label: `* ${g.filters
              .map((f) => (availableObjectTypeFields.find((s) => s.id === f.property) || { label: '?' }).label)
              .join(` ${SearchFilterGroup.OPERATOR_LABEL[g.operator]} `)} *`,
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
      tap((f) => (this.filters = f || {})),
      switchMap(() => this.userService.getGlobalSettings(this.STORAGE_KEY_FILTERS)),
      tap((filters) => !global && Object.values(filters || {}).forEach((v: any) => !this.isDefaultFilter(v.id) && (v.id = '__' + v.id))),
      map((filters) =>
        Object.values({ ...(filters || {}), ...this.filters }).map((s: any) => ({
          ...s,
          value: [SearchFilterGroup.fromQuery(this.parseStoredFilters(s.value))]
        }))
      )
    );
  }

  private parseStoredFilters(filters: string): any {
    let res = {};
    try {
      res = JSON.parse(filters);
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
    this.appCacheService.setItem(this.STORAGE_KEY_FILTERS_LAST, this.filtersLast).subscribe();
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

  saveFilters(global = false, filters = this.filters) {
    global
      ? this.userService.saveGlobalSettings(this.STORAGE_KEY_FILTERS, filters).subscribe()
      : this.userService.saveSettings(this.STORAGE_KEY_FILTERS, filters).subscribe();
    return this.loadStoredFilters(of(filters), global);
  }

  saveFilter(item: Selectable, global = false) {
    this.filters[item.id] = { ...item, value: SearchFilterGroup.fromArray(item.value).toShortString() };
    return this.saveFilters(global);
  }

  removeFilter(item: Selectable, global = false) {
    delete this.filters[item.id];
    return this.saveFilters(global);
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
        items: ['*word*', '*pdf*', '*image*', '*audio*', '*video*', '*excel*', '*mail*', '*text*'].sort().map((r) => ({
          id: '__' + MIME_TYPE.id + '#' + r,
          label: r.replace(/\*/g, ''),
          value: [
            new SearchFilter(MIME_TYPE.id, SearchFilter.OPERATOR.IN, r === '*excel*' ? [r, '*sheet*'] : r === '*mail*' ? ['*message*', '*outlook*'] : [r])
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
      }
    ].filter((v) => v);
  }
}
