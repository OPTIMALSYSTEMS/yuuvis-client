import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  AggregateResult,
  AppCacheService,
  BaseObjectTypeField,
  ContentStreamField,
  ObjectType,
  ObjectTypeGroup,
  SearchFilter,
  SearchQuery,
  SearchService,
  SystemService,
  TranslateService,
  UserService,
  Utils
} from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DynamicDate } from '../../form/elements/datetime/datepicker/datepicker.interface';
import { DatepickerService } from '../../form/elements/datetime/datepicker/service/datepicker.service';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { FileSizePipe } from '../../pipes/filesize.pipe';
@Injectable({
  providedIn: 'root'
})
export class QuickSearchService {
  private STORAGE_KEY_FILTERS_VISIBLE = 'yuv.framework.search.filters.visibility';
  private STORAGE_KEY_FILTERS_LAST = 'yuv.framework.search.filters.last';
  private STORAGE_KEY_FILTERS = 'yuv.framework.search.filters';

  private filters = {};
  private filtersVisibility = [];
  private filtersLast = [];
  availableObjectTypes: Selectable[] = [];
  availableObjectTypeGroups: SelectableGroup[] = [];

  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  skipTypes = [];

  // fields that should not be searchable
  skipFields = [
    // ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    // BaseObjectTypeField.CREATED_BY,
    // BaseObjectTypeField.MODIFIED_BY,
    BaseObjectTypeField.OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

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
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          value: ot
        }))
        .sort(Utils.sortValues('label'));
      let i = 0;
      this.availableObjectTypeGroups = this.systemService.getGroupedObjectTypes().map((otg: ObjectTypeGroup) => ({
        id: `${i++}`,
        label: otg.label,
        items: otg.types.map((ot: ObjectType) => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          highlight: ot.isFolder,
          svg: this.systemService.getObjectTypeIcon(ot.id),
          value: ot
        }))
      }));
    });
  }

  getAvailableFilterGroups(storedFilters: Selectable[], availableObjectTypeFields: Selectable[]) {
    const groups = storedFilters.reduce((prev, cur) => {
      cur.value.forEach((f) => (prev[f.property] = (prev[f.property] || []).concat([cur])));
      return prev;
    }, {});
    return Object.keys(groups).map((key) => ({ id: key, label: availableObjectTypeFields.find((f) => f.id === key).label, items: groups[key] }));
  }

  getActiveTypes(query: SearchQuery) {
    return this.searchService.aggregate(query, [BaseObjectTypeField.OBJECT_TYPE_ID]).pipe(
      map((res: AggregateResult) => {
        return res.aggregations && res.aggregations.length
          ? res.aggregations[0].entries
              .map((r) => ({ id: r.key, label: this.systemService.getLocalizedResource(`${r.key}_label`), count: r.count }))
              .sort(Utils.sortValues('label'))
          : [];
      })
    );
  }

  getAvailableObjectTypesFields(selectedTypes = []): Selectable[] {
    let sharedFields;

    const selectedObjectTypes: ObjectType[] = selectedTypes.length
      ? this.systemService.getObjectTypes().filter((t) => selectedTypes.includes(t.id))
      : this.systemService.getObjectTypes();

    selectedObjectTypes.forEach((t) => {
      if (!sharedFields) {
        sharedFields = t.fields;
      } else {
        // check for fields that are not part of the shared fields
        const fieldIDs = t.fields.map((f) => f.id);
        sharedFields = sharedFields.filter((f) => fieldIDs.includes(f.id));
      }
    });

    return sharedFields
      .filter((f) => !this.skipFields.includes(f.id))
      .map((f) => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  getActiveFilters(query: SearchQuery, filters: Selectable[], availableObjectTypeFields: Selectable[]) {
    // todo: resolve multiFilters
    // todo: resolve custom filter label
    return query.filters
      .filter((f) => !this.skipFields.includes(f.property))
      .map((f) => {
        return (
          filters.find((sf) => sf.value[0].toString() === f.toString()) || {
            id: f.property + '#' + Utils.uuid(),
            highlight: true,
            label: `* ${availableObjectTypeFields.find((s) => s.id === f.property).label} *`,
            value: [f]
          }
        );
      });
  }

  loadLastFilters() {
    return this.appCacheService.getItem(this.STORAGE_KEY_FILTERS_LAST).pipe(tap((f) => (this.filtersLast = f || [])));
  }

  loadFiltersVisibility() {
    return this.userService.getSettings(this.STORAGE_KEY_FILTERS_VISIBLE).pipe(
      // return this.appCacheService.getItem(this.STORAGE_KEY_FILTERS_VISIBLE).pipe(
      tap((f) => (this.filtersVisibility = (f && f.visible) || [])),
      map((f) => f && f.visible)
    );
  }

  loadStoredFilters(store?: Observable<any>) {
    return (store || this.userService.getSettings(this.STORAGE_KEY_FILTERS)).pipe(
      // return (store || this.appCacheService.getItem(this.STORAGE_KEY_FILTERS)).pipe(
      tap((f) => (this.filters = f || {})),
      map(() => Object.values(this.filters).map((s: any) => ({ ...s, value: s.value.map((v) => this.parseSearchFilter(v)) })))
    );
  }

  loadFilters(storedFilters: Selectable[], availableObjectTypeFields: Selectable[]) {
    const available = availableObjectTypeFields.map((a) => a.id);
    return [...storedFilters.filter((v: Selectable) => this.isMatching(v, available)), ...this.getDefaultFiltersList(availableObjectTypeFields)]
      .map((f) => ({ ...f, highlight: !f.id.startsWith('__') }))
      .sort((a, b) => (a.id.replace(/#.*/, '') === b.id.replace(/#.*/, '') ? 0 : Utils.sortValues('label').call(this, a, b)));
  }

  private isMatching(v: Selectable, available: string[]) {
    // todo: support partially matching ???
    const properties = v.value.map((v) => v.property);
    return properties.every((p) => available.includes(p));
  }

  private parseSearchFilter(filter: string): any {
    const qFilter = JSON.parse(filter);
    const { op, v, v2 } = Object.values(qFilter)[0] as any;
    return new SearchFilter(Object.keys(qFilter)[0], op, v, v2);
  }

  saveLastFilters(ids: string[]) {
    // persist last 20 filters
    this.filtersLast = [...ids].concat(this.filtersLast.filter((f) => !ids.includes(f))).slice(0, 20);
    this.appCacheService.setItem(this.STORAGE_KEY_FILTERS_LAST, this.filtersLast).subscribe();
    return of(this.filtersLast);
  }

  saveFiltersVisibility(ids: string[]) {
    this.filtersVisibility = [...ids];
    this.userService.saveSettings(this.STORAGE_KEY_FILTERS_VISIBLE, { visible: this.filtersVisibility }).subscribe();
    // this.appCacheService.setItem(this.STORAGE_KEY_FILTERS_VISIBLE, { visible: this.filtersVisibility }).subscribe();
    return of(this.filtersVisibility);
  }

  saveFilters(filters = this.filters) {
    this.userService.saveSettings(this.STORAGE_KEY_FILTERS, filters).subscribe();
    // this.appCacheService.setItem(this.STORAGE_KEY_FILTERS, filters).subscribe();
    return this.loadStoredFilters(of(filters));
  }

  saveFilter(item: Selectable) {
    this.filters[item.id] = { ...item, value: item.value.map((v) => v.toString()) };
    return this.saveFilters();
  }

  removeFilter(item: Selectable) {
    delete this.filters[item.id];
    return this.saveFilters();
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
        items: ['*word*', '*pdf*', '*image*'].map((r) => ({
          id: '__' + MIME_TYPE.id + '#' + r,
          label: r.replace(/\*/g, ''),
          value: [new SearchFilter(MIME_TYPE.id, SearchFilter.OPERATOR.IN, [r])]
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
