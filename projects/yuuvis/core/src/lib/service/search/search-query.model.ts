import { RangeValue } from './../../model/range-value.model';
import { Utils } from './../../util/utils';
import { SearchQueryProperties } from './search.service.interface';
/**
 * Search query properties
 */
export class SearchQuery {
  term: string;
  fields: string[];
  size: number = 50;
  aggs: string[];
  from: number;
  types: string[] = []; // mixed list of primary and secondary object types
  lots: string[] = []; // list of leading object types
  tags: any;
  get targetType(): string | null {
    return this.lots?.length === 1 ? this.lots[0] : this.types?.length === 1 ? this.types[0] : null;
  }
  get filters(): SearchFilter[] {
    return this.filterGroup.filters;
  }
  get allTypes(): string[] {
    return [...(this.types || []), ...(this.lots || [])];
  }

  filterGroup: SearchFilterGroup = new SearchFilterGroup();
  hiddenFilterGroup: SearchFilterGroup = new SearchFilterGroup(); // hidden filters that will be combined with SearchQuery filters via search service
  sortOptions: SortOption[] = [];

  constructor(searchQueryProperties?: SearchQueryProperties) {
    if (searchQueryProperties) {
      this.term = searchQueryProperties.term;
      this.from = searchQueryProperties.from;
      this.types = searchQueryProperties.types || [];
      this.lots = searchQueryProperties.lots || [];
      this.fields = searchQueryProperties.fields || [];

      if (searchQueryProperties.size) {
        this.size = searchQueryProperties.size;
      }

      if (searchQueryProperties.tags) {
        this.tags = searchQueryProperties.tags;
      }

      if (searchQueryProperties.filters) {
        this.filterGroup = SearchFilterGroup.fromQuery(searchQueryProperties.filters);
      }

      if (searchQueryProperties.hiddenFilters) {
        this.hiddenFilterGroup = SearchFilterGroup.fromQuery(searchQueryProperties.hiddenFilters);
      }

      if (searchQueryProperties.sort) {
        searchQueryProperties.sort.forEach((o) => this.addSortOption(o.field, o.order));
      }
    }
  }
  /**
   * Adds a new target type to the query
   *
   * @param objectTypeId Object type to be added
   */
  public addType(objectTypeId: string) {
    if (!this.types.includes(objectTypeId)) {
      this.types.push(objectTypeId);
    }
  }

  /**
   * Removes a type from the target lots (Leading Object Types) list
   *
   * @param objectTypeId The object type to be removed
   */
  public removeType(objectTypeId: string) {
    this.types = this.types.filter((t) => t !== objectTypeId);
  }

  /** Adds a new target lot (Leading Object Type) to the query
   *
   * @param lot The leading object type to be added
   */
  public addLOT(lot: string) {
    if (this.lots.includes(lot)) {
      this.lots.push(lot);
    }
  }

  /**
   * Removes a lot from the target lots (Leading Object Types)  list
   *
   * @param lot The leading object type to be removed
   */
  public removeLOT(lot: string) {
    this.lots = this.lots.filter((t) => t !== lot);
  }

  /**
   * Adds or removes the given type based on the current settings
   *
   * @param objectTypeId The object type to be toggled
   */
  public toggleType(objectTypeId: string) {
    return this.types.includes(objectTypeId) ? this.removeType(objectTypeId) : this.addType(objectTypeId);
  }

  public addFilterGroup(group: SearchFilterGroup, groupProperty = SearchFilterGroup.DEFAULT) {
    if (group) {
      // add to group
      const searchFilterGroup =
        groupProperty === SearchFilterGroup.DEFAULT ? this.filterGroup : this.filterGroup.groups.find((g) => g.property === groupProperty);
      if (searchFilterGroup) {
        searchFilterGroup.group.push(group);
      }
    }
  }

  public removeFilterGroup(groupProperty = SearchFilterGroup.DEFAULT, remove?: (f: SearchFilterGroup) => boolean) {
    // remove from group
    const searchFilterGroup =
      groupProperty === SearchFilterGroup.DEFAULT ? this.filterGroup : this.filterGroup.groups.find((g) => g.property === groupProperty);
    if (searchFilterGroup) {
      const parent = this.filterGroup.findParent(searchFilterGroup.id);
      if (parent) {
        parent.group = parent.group.filter((f) => f.property !== groupProperty || (remove ? !remove(f as SearchFilterGroup) : false));
        if (parent.isEmpty()) {
          this.filterGroup.remove(parent.id);
        }
      }
    }
  }

  /**
   * Adds a new filter to the query. If there already is a filter set for the given property, it will be overridden.
   *
   * @param filter The filter to be added
   */
  public addFilter(filter: SearchFilter, groupProperty = SearchFilterGroup.DEFAULT, groupOperator = SearchFilterGroup.OPERATOR.AND) {
    if (filter) {
      // if there already is a filter set for the target property
      // we'll just override it with the new value
      this.removeFilter(filter.property, groupProperty, (f) => f.toString() === filter.toString());
      // this.filters.push(filter);

      // add to group
      const searchFilterGroup =
        groupProperty === SearchFilterGroup.DEFAULT ? this.filterGroup : this.filterGroup.groups.find((g) => g.property === groupProperty);
      if (searchFilterGroup) {
        searchFilterGroup.group.push(filter);
      } else {
        this.filterGroup.group.push(new SearchFilterGroup(groupProperty, groupOperator, [filter])); // TODO: find a way to push to deeper groups
      }
    }
  }

  /**
   * Removes a filter from the query.
   *
   * @param filterPropertyName The filter (its property name) to be removed
   */
  public removeFilter(filterPropertyName: string, groupProperty = SearchFilterGroup.DEFAULT, remove?: (f: SearchFilter) => boolean) {
    // this.filters = this.filters.filter((f) => f.property !== filterPropertyName);

    // remove from group
    const searchFilterGroup =
      groupProperty === SearchFilterGroup.DEFAULT ? this.filterGroup : this.filterGroup.groups.find((g) => g.property === groupProperty);
    if (searchFilterGroup) {
      searchFilterGroup.group = searchFilterGroup.group.filter((f) => f.property !== filterPropertyName || (remove ? !remove(f as SearchFilter) : false));
      if (searchFilterGroup.isEmpty()) {
        this.filterGroup.group = this.filterGroup.group.filter((g) => !g.isEmpty()); // TODO: needs to be recursive for deep groups
      }
    }
  }

  /**
   * Removes all filters from the query.
   */
  public clearFilters() {
    this.filterGroup = new SearchFilterGroup();
  }

  /**
   * Adds or removes the given filter based on the current settings
   *
   * @param filter The filter to be toggled
   * @param override If set to true, will override an existing filter
   */
  public toggleFilter(filter: SearchFilter, override?: boolean) {
    if (override || !this.getFilter(filter.property)) {
      this.addFilter(filter);
    } else {
      this.removeFilter(filter.property);
    }
  }

  /**
   * Retrieves a filter by its property name.
   *
   * @param propertyName The filters property name (name of form element)
   * @returns Search Filter Object
   */
  public getFilter(propertyName: string): SearchFilter {
    return this.filters.find((f) => f.property === propertyName);
  }

  /**
   * Adding new Sort Options
   * Sort Options are only added if they are not already present
   *
   * @param name
   * @param order
   * @param missing
   */
  public addSortOption(name: string, order: string, missing?: string) {
    if (!this.sortOptions.find((s) => s.field === name)) {
      this.sortOptions.push(new SortOption(name, order, missing));
    }
  }

  /**
   *
   * @param name
   */
  removeSortOption(name: string) {
    this.sortOptions = this.sortOptions.filter((s) => s.field !== name);
  }

  /**
   * Create query JSON from current query that can be send to
   * the search service
   * @param combineFilters If set to true, will combine original filters and default (hidden) filters
   */
  toQueryJson(combineFilters = false): SearchQueryProperties {
    const queryJson: SearchQueryProperties = {
      size: this.size
    };

    if (this.term) {
      queryJson.term = this.term;
    }

    if (this.tags) {
      queryJson.tags = this.tags;
    }

    if (this.from) {
      queryJson.from = this.from;
    }

    if (this.types.length) {
      queryJson.types = this.types;
    }

    if (this.lots.length) {
      queryJson.lots = this.lots;
    }

    if (this.fields && this.fields.length) {
      queryJson.fields = this.fields;
    }

    if (this.filterGroup && !this.filterGroup.isEmpty()) {
      const fg = this.filterGroup.toShortQuery();
      queryJson.filters = fg.filters.length > 1 && this.filterGroup.operator === SearchFilterGroup.OPERATOR.OR ? [fg] : fg.filters;
    }

    if (this.hiddenFilterGroup && !this.hiddenFilterGroup.isEmpty()) {
      const fg = this.hiddenFilterGroup.toShortQuery();
      const filters = fg.filters.length > 1 && this.filterGroup.operator === SearchFilterGroup.OPERATOR.OR ? [fg] : fg.filters;
      if (combineFilters) {
        queryJson.filters = filters.concat(queryJson.filters || []);
      } else {
        queryJson.hiddenFilters = filters;
      }
    }

    if (this.aggs && this.aggs.length) {
      queryJson.aggs = this.aggs;
    }

    if (this.sortOptions && this.sortOptions.length) {
      queryJson.sort = this.sortOptions.map((o: SortOption) => ({
        field: o.field,
        order: o.order
      }));
    }

    return queryJson;
  }
}

export class SearchFilterGroup {
  public static DEFAULT = '_default';

  /**
   * available operators for a search group
   */
  public static OPERATOR = {
    AND: 'AND',
    OR: 'OR'
  };

  /**
   * available operator labels for a search group
   */
  public static OPERATOR_LABEL = {
    AND: '&',
    OR: '|'
  };

  public static fromQuery(query: any) {
    if (query) {
      const group = (Array.isArray(query) ? query : query.filters || []).map((g) => (g.filters ? SearchFilterGroup.fromQuery(g) : SearchFilter.fromQuery(g)));
      const single = group.length === 1 && group[0].group && group[0];
      return new SearchFilterGroup(query.property, single?.operator || query.lo, single?.group || group);
    } else {
      return undefined;
    }
  }

  public static fromArray(arr: any) {
    return arr instanceof SearchFilterGroup
      ? arr
      : arr.length === 1 && arr[0] instanceof SearchFilterGroup
      ? arr[0]
      : new SearchFilterGroup(undefined, undefined, [...arr]);
  }

  id = Utils.uuid();

  clone(short = true) {
    return SearchFilterGroup.fromQuery(short ? this.toShortQuery() : this.toQuery());
  }

  find(id: string) {
    return this.id === id ? this : this.group.reduce((prev, cur) => prev || (cur instanceof SearchFilterGroup ? cur.find(id) : cur.id === id && cur), null);
  }

  findParent(id: string, parent?: SearchFilterGroup) {
    return this.id === id
      ? parent
      : this.group.reduce((prev, cur) => prev || (cur instanceof SearchFilterGroup ? cur.findParent(id, this) : cur.id === id && this), null);
  }

  remove(id: string) {
    const parent = this.findParent(id);
    if (parent) {
      parent.group = parent.group.filter((f) => f.id !== id);
      if (parent.isEmpty()) {
        this.remove(parent.id);
      }
    }
  }

  /**
   * flat list of all groups
   */
  get groups(): SearchFilterGroup[] {
    return this.group.reduce((prev, cur) => [...prev, ...(cur instanceof SearchFilterGroup ? [cur, ...cur.groups] : [])], []);
  }

  /**
   * flat list of all filters
   */
  get filters(): SearchFilter[] {
    return this.group.reduce((prev, cur) => [...prev, ...(cur instanceof SearchFilterGroup ? cur.filters : [cur])], []);
  }

  /**
   * Constructor for creating a new SearchFilterGroup.
   *
   * @param property The qualified name of the field this group should apply to.
   * @param operator Operator indicating how to handle the groups. See SearchFilterGroup.OPERATOR for available operators.
   * @param group Array of filters or other groups
   */
  constructor(
    public property: string = SearchFilterGroup.DEFAULT,
    public operator: string = SearchFilterGroup.OPERATOR.AND,
    public group: (SearchFilter | SearchFilterGroup)[] = []
  ) {}

  /**
   * @ignore
   */
  match(property: string, operator: string, group: (SearchFilter | SearchFilterGroup)[]) {
    return this.property === property && this.operator === operator && this.group.every((g, i) => g.toString() === group[i].toString());
  }

  isEmpty() {
    return Utils.isEmpty(this.group);
  }

  toQuery() {
    return {
      property: this.property,
      lo: this.operator,
      filters: this.group
        .filter((g) => (g instanceof SearchFilterGroup ? g.filters.filter((f) => !f.excludeFromQuery).length : !g.excludeFromQuery))
        .map((g) => (g instanceof SearchFilterGroup ? g.toQuery() : g.toQuery()))
    };
  }

  toShortQuery() {
    return {
      ...(this.property !== SearchFilterGroup.DEFAULT ? { property: this.property } : {}),
      ...(this.operator !== SearchFilterGroup.OPERATOR.AND ? { lo: this.operator } : {}),
      filters: this.group
        .filter((g) => (g instanceof SearchFilterGroup ? g.filters.filter((f) => !f.excludeFromQuery).length : !g.excludeFromQuery))
        .map((g) =>
          g instanceof SearchFilterGroup
            ? g.filters.filter((f) => !f.excludeFromQuery).length === 1
              ? g.filters.filter((f) => !f.excludeFromQuery)[0].toQuery()
              : g.toShortQuery()
            : g.toQuery()
        )
    };
  }

  toString() {
    return JSON.stringify(this.toQuery());
  }

  toShortString() {
    return JSON.stringify(this.toShortQuery());
  }
}

export class SearchFilter {
  /**
   * available operators for a search filter
   */
  public static OPERATOR = {
    /** equal */
    EQUAL: 'eq',
    /** eequal */
    EEQUAL: 'eeq',
    /** match at least one of the provided values (value has to be an array)  */
    IN: 'in',
    /** greater than */
    GREATER_THAN: 'gt',
    /** greater than or equal */
    GREATER_OR_EQUAL: 'gte', //
    LESS_THAN: 'lt', // less than
    LESS_OR_EQUAL: 'lte', // less than or equal
    INTERVAL: 'gtlt', // interval
    INTERVAL_INCLUDE_BOTH: 'gtelte', // interval include left and right
    INTERVAL_INCLUDE_TO: 'gtlte', // interval include right
    INTERVAL_INCLUDE_FROM: 'gtelt', // interval include left
    RANGE: 'rg', // aggegation ranges
    LIKE: 'like'
  };

  /**
   * available operator labels for a search filter
   */
  public static OPERATOR_LABEL = {
    /** equal */
    EQUAL: '=',
    /** match at least one of the provided values (value has to be an array)  */
    IN: '~',
    /** greater than */
    GREATER_THAN: '>',
    /** greater than or equal */
    GREATER_OR_EQUAL: '≽', //
    LESS_THAN: '<', // less than
    LESS_OR_EQUAL: '≼', // less than or equal
    INTERVAL: '<>', // interval
    INTERVAL_INCLUDE_BOTH: '-', // interval include left and right
    INTERVAL_INCLUDE_TO: '>-', // interval include right
    INTERVAL_INCLUDE_FROM: '-<', // interval include left
    RANGE: '=' // aggegation ranges
  };

  public static fromQuery(query: any) {
    return new SearchFilter(query.f, query.o, query.v1, query.v2);
  }

  id = Utils.uuid();

  excludeFromQuery = false;

  clone() {
    return SearchFilter.fromQuery(this.toQuery());
  }

  /**
   * Constructor for creating a new SearchFilter.
   *
   * @param property The qualified name of the field this filter should apply to.
   * @param operator Operator indicating how to handle the filters value(s). See SearchFilter.OPERATOR for available operators.
   * @param firstValue The filters value
   * @param secondValue Optional second value for filters that for example define ranges of values
   */
  constructor(public property: string, public operator: string, public firstValue: any, public secondValue?: any) {
    if (firstValue instanceof RangeValue) {
      this.operator = firstValue.operator;
      this.firstValue = firstValue.firstValue;
      this.secondValue = firstValue.secondValue;
    }
  }

  /**
   * @ignore
   */
  match(property: string, operator: string, firstValue: any, secondValue?: any) {
    return (
      this.property === property &&
      this.operator === operator &&
      this.secondValue === secondValue &&
      (this.firstValue instanceof Array ? !!this.firstValue.find((v) => v === firstValue) : this.firstValue === firstValue)
    );
  }

  isEmpty() {
    return Utils.isEmpty(this.firstValue) || (this.operator?.match(/gt(e)?lt(e)?/) ? Utils.isEmpty(this.secondValue) : false);
  }

  toQuery() {
    return { f: this.property, o: this.operator, v1: this.firstValue, v2: this.secondValue };
  }

  toString() {
    return JSON.stringify(this.toQuery());
  }
}
/**
 * Sortig criteria of objects searching result
 */
export class SortOption {
  constructor(public field: string, public order: string, public missing?: string) {}
}
