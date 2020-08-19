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
  types: string[] = [];
  get targetType(): string | null {
    return this.types && this.types.length === 1 ? this.types[0] : null;
  }
  filters: SearchFilter[] = [];
  sortOptions: SortOption[] = [];

  constructor(searchQueryProperties?: SearchQueryProperties) {
    if (searchQueryProperties) {
      this.term = searchQueryProperties.term;
      this.from = searchQueryProperties.from;
      this.types = searchQueryProperties.types || [];
      this.fields = searchQueryProperties.fields || [];

      if (searchQueryProperties.size) {
        this.size = searchQueryProperties.size;
      }

      if (searchQueryProperties.filters) {
        this.filters = [];
        Object.keys(searchQueryProperties.filters).forEach((k) => {
          const filterValue = searchQueryProperties.filters[k];
          this.filters.push(new SearchFilter(k, filterValue.o, filterValue.v1, filterValue.v2));
        });
      }

      if (searchQueryProperties.sort) {
        searchQueryProperties.sort.forEach((o) => this.addSortOption(o.field, o.order));
      }
    }
  }
  /**
   * Adds a new target type to the query
   *
   * @param type Object type to be added
   */
  public addType(objectTypeId: string) {
    if (this.types.indexOf(objectTypeId) === -1) {
      this.types.push(objectTypeId);
    }
  }

  /**
   * Removes a type from the target types list
   *
   * @param type The object type to be removed
   */
  public removeType(objectTypeId: string) {
    this.types = this.types.filter((t) => t !== objectTypeId);
  }

  /**
   * Adds or removes the given type based on the current settings
   *
   * @param type The object type to be toggled
   */
  public toggleType(objectTypeId: string) {
    if (this.types.find((t) => t === objectTypeId)) {
      this.removeType(objectTypeId);
    } else {
      this.types.push(objectTypeId);
    }
  }

  /**
   * Adds a new filter to the query. If there already is a filter set for the given property, it will be overridden.
   *
   * @param filter The filter to be added
   */
  public addFilter(filter: SearchFilter) {
    if (!filter) {
      return;
    }
    if (!this.getFilter(filter.property)) {
      this.filters.push(filter);
    } else {
      // if there already is a filter set for the target property
      // we'll just override it with the new value
      this.removeFilter(filter.property);
      this.filters.push(filter);
    }
  }

  /**
   * Removes a filter from the query.
   *
   * @param filterPropertyName The filter (its property name) to be removed
   */
  public removeFilter(filterPropertyName: string) {
    this.filters = this.filters.filter((f) => f.property !== filterPropertyName);
  }

  /**
   * Removes all filters from the query.
   */
  public clearFilters() {
    this.filters = [];
  }

  /**
   * Adds or removes the given filter based on the current settings
   *
   * @param filter The filter to be toggled
   * @param override If set to true, will override an existing filter
   */
  public toggleFilter(filter: SearchFilter, override?: boolean) {
    if (this.getFilter(filter.property)) {
      this.removeFilter(filter.property);
      if (override) {
        this.filters.push(filter);
      }
    } else {
      this.filters.push(filter);
    }
  }

  /**
   * Retrieves a filter by its property name.
   *
   * @param propertyName The filters property name (qname of form element)
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
   */
  toQueryJson(): SearchQueryProperties {
    const queryJson: SearchQueryProperties = {
      size: this.size
    };

    if (this.term) {
      queryJson.term = this.term;
    }

    if (this.from) {
      queryJson.from = this.from;
    }

    if (this.types.length) {
      queryJson.types = this.types;
    }

    if (this.fields && this.fields.length) {
      queryJson.fields = this.fields;
    }

    if (this.filters.length) {
      queryJson.filters = {};
      this.filters.forEach((f) => {
        queryJson.filters[f.property] = {
          o: f.operator,
          v1: f.firstValue,
          v2: f.secondValue
        };
      });
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

/**
 * `SearchFilter` is used for a filtering of searching results of DmsObjects.
 */
export class SearchFilter {
  /**
   * available operators for a search filter
   */
  public static OPERATOR = {
    /** equal */
    EQUAL: 'eq',
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
    RANGE: 'rg' // aggegation ranges
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
    return Utils.isEmpty(this.firstValue) || (this.operator.match(/gt(e)?lt(e)?/) ? Utils.isEmpty(this.secondValue) : false);
  }

  toQuery() {
    return { [this.property]: { op: this.operator, v: this.firstValue, v2: this.secondValue } };
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
