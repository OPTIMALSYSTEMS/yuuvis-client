import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  AppCacheService,
  BaseObjectTypeField,
  ContentStreamField,
  ObjectType,
  ObjectTypeGroup,
  SearchFilter,
  SearchQuery,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
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
  private STORAGE_KEY_FILTERS = 'yuv.framework.search.filters';

  private filters = {};
  private filtersVisibility = {};
  availableObjectTypes: Selectable[] = [];
  availableObjectTypeGroups: SelectableGroup[] = [];

  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  skipTypes = [];

  // fields that should not be searchable
  skipFields = [
    // ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.CREATED_BY,
    BaseObjectTypeField.MODIFIED_BY,
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
    private appCacheService: AppCacheService
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
            label: availableObjectTypeFields.find((s) => s.id === f.property).label + ' ( Custom )',
            value: [f]
          }
        );
      });
  }

  loadFiltersVisibility() {
    return this.appCacheService.getItem(this.STORAGE_KEY_FILTERS_VISIBLE).pipe(tap((f) => (this.filtersVisibility = f || [])));
  }

  loadFilters(availableObjectTypeFields: Selectable[]) {
    const available = availableObjectTypeFields.map((a) => a.id);
    return this.appCacheService.getItem(this.STORAGE_KEY_FILTERS).pipe(
      tap((f) => (this.filters = f || {})),
      map(() => Object.values(this.filters).map((s: any) => ({ ...s, value: s.value.map((v) => this.parseSearchFilter(v)) }))),
      map((list) =>
        [...list.filter((v: Selectable) => this.isMatching(v, available)), ...this.getDefaultFiltersList(availableObjectTypeFields)]
          .map((f) => ({ ...f, highlight: !f.id.startsWith('__') }))
          .sort(Utils.sortValues('label'))
      )
    );
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

  saveFiltersVisibility(ids: string[]) {
    this.appCacheService.setItem(this.STORAGE_KEY_FILTERS_VISIBLE, ids).subscribe();
  }

  saveFilter(item: Selectable) {
    this.filters[item.id] = { ...item, value: item.value.map((v) => v.toString()) };
    this.appCacheService.setItem(this.STORAGE_KEY_FILTERS, this.filters).subscribe();
  }

  getDefaultFiltersList(availableObjectTypeFields: Selectable[]) {
    return this.getDefaultFilters(availableObjectTypeFields)
      .reduce((prev, cur) => {
        cur.items.forEach((i) => (i.label = `${cur.label} ( ${i.label} )`));
        return [...prev, ...cur.items];
      }, [])
      .sort(Utils.sortValues('label'));
  }

  getDefaultFilters(availableObjectTypeFields: Selectable[]) {
    const filesizePipe = new FileSizePipe(this.translate);
    const key = 'yuv.framework.search.agg.time.';
    const timeRange: DynamicDate[] = ['today', 'yesterday', 'thisweek', 'thismonth', 'thisyear'];

    const CREATION_DATE = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.CREATION_DATE);
    const MODIFICATION_DATE = availableObjectTypeFields.find((s) => s.id === BaseObjectTypeField.MODIFICATION_DATE);
    const MIME_TYPE = availableObjectTypeFields.find((s) => s.id === ContentStreamField.MIME_TYPE);
    const LENGTH = availableObjectTypeFields.find((s) => s.id === ContentStreamField.LENGTH);

    return [
      // {
      //   id: 'custom',
      //   label: 'Custom Filters',
      //   items: this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, undefined, undefined)] }))
      // },
      CREATION_DATE && {
        id: 'created',
        label: CREATION_DATE.label,
        items: timeRange.map((r) => ({
          id: '__' + CREATION_DATE.id + '#' + r,
          label: this.translate.instant(key + r),
          value: [
            new SearchFilter(
              CREATION_DATE.id,
              SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH,
              new Date(this.datepickerService.getDateFromType(r, getLocaleFirstDayOfWeek(this.translate.currentLang))).toISOString(),
              new Date(this.datepickerService.getDateFromType('now', getLocaleFirstDayOfWeek(this.translate.currentLang))).toISOString()
            )
          ]
        }))
      },
      MODIFICATION_DATE && {
        id: 'created',
        label: MODIFICATION_DATE.label,
        items: timeRange.map((r) => ({
          id: '__' + MODIFICATION_DATE.id + '#' + r,
          label: this.translate.instant(key + r),
          value: [
            new SearchFilter(
              MODIFICATION_DATE.id,
              SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH,
              new Date(this.datepickerService.getDateFromType(r, getLocaleFirstDayOfWeek(this.translate.currentLang))).toISOString(),
              new Date(this.datepickerService.getDateFromType('now', getLocaleFirstDayOfWeek(this.translate.currentLang))).toISOString()
            )
          ]
        }))
      },
      MIME_TYPE && {
        id: 'mime',
        label: MIME_TYPE.label,
        items: ['*word*', '*pdf*', '*image*'].map((r) => ({
          id: '__' + MIME_TYPE.id + '#' + r,
          label: r.replace(/\*/g, ''),
          value: [new SearchFilter(MIME_TYPE.id, SearchFilter.OPERATOR.EQUAL, [r])]
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
