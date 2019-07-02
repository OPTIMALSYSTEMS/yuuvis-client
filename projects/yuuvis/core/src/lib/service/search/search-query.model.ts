import { SearchQueryProperties } from './search.service.interface';

export class SearchQuery {
  term: string;
  types: string[] = [];
  filters: SearchFilter[] = [];

  constructor(searchQueryProperties?: SearchQueryProperties) {
    if (searchQueryProperties) {
      this.term = searchQueryProperties.term;
      this.filters = searchQueryProperties.filters;
      this.types = searchQueryProperties.types;
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
    this.types = this.types.filter(t => t !== objectTypeId);
  }

  /**
   * Adds or removes the given type based on the current settings
   *
   * @param type The object type to be toggled
   */
  public toggleType(objectTypeId: string) {
    if (this.types.find(t => t === objectTypeId)) {
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
    this.filters = this.filters.filter(f => f.property !== filterPropertyName);
  }

  /**
   * Adds or removes the given filter based on the current settings
   *
   * @param filter The filter to be toggled
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
    return this.filters.find(f => f.property === propertyName);
  }

  public toJson(): SearchQueryProperties {
    return {
      term: this.term,
      filters: this.filters,
      types: this.types
    };
  }
}

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
   * Constructor for creating a new SearchFilter.
   *
   * @param property The qualified name of the field this filter should apply to.
   * @param operator Operator indicating how to handle the filters value(s). See SearchFilter.OPERATOR for available operators.
   * @param firstValue The filters value
   * @param secondValue Optional second value for filters that for example define ranges of values
   */
  constructor(
    public property: string,
    public operator: string,
    public firstValue: any,
    public secondValue?: any
  ) {}

  /**
   * @ignore
   */
  match(
    property: string,
    operator: string,
    firstValue: any,
    secondValue?: any
  ) {
    return (
      this.property === property &&
      this.operator === operator &&
      this.secondValue === secondValue &&
      (this.firstValue instanceof Array
        ? !!this.firstValue.find(v => v === firstValue)
        : this.firstValue === firstValue)
    );
  }
}
