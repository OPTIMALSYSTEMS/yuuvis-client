/**
 * Interface providing a search service
 */
export interface SearchResult {
  hasMoreItems: boolean;
  totalNumItems: number;
  items: SearchResultItem[];
  /**
   * object types within the result
   */

  objectTypes: string[];
}
/**
 * Interface for the item of search results
 */
export interface SearchResultItem {
  objectTypeId: string;
  content?: SearchResultContent;
  permissions?: SearchResultPermissions;
  fields: Map<string, any>;
}

export interface SearchResultPermissions {
  read: Array<'metadata' | 'content'>;
  write: Array<'metadata' | 'content'>;
  delete: Array<'object' | 'content'>;
}

export interface SearchResultContent {
  contentStreamId: string;
  repositoryId: string;
  digest: string;
  fileName: string;
  size: number;
  archivePath: string;
  range: string;
  mimeType: string;
}
/**
 * Interface providing search query properties, that can be send to
 * the search service
 */
export interface SearchQueryProperties {
  term?: string;
  size?: number;
  fields?: string[];
  from?: number;
  aggs?: string[];
  maxItems?: number;
  types?: string[]; // mixed list of primary and secondary object types
  lots?: string[]; // list of leading object types
  filters?: any;
  hiddenFilters?: any; // hidden filters that will be combined with SearchQuery filters via search service
  sort?: any;
  tags?: any;
}

/**
 * Interface providing the estimated result of the current query.
 */
export interface AggregateResult {
  /**
   * number of results found
   */
  totalNumItems: number;
  aggregations: Aggregation[];
}

/**
 * Property of a one search query aggregation
 */
export interface Aggregation {
  aggKey: string;
  entries: {
    key: string;
    count: number;
  }[];
}
