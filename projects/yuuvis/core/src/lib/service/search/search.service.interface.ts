import { SearchFilter } from './search-query.model';

export interface SearchResult {
  // the statement that was executed to get the current result
  // Use for fetching the next page for example
  statement: string;
  hasMoreItems: boolean;
  totalNumItems: number;
  items: SearchResultItem[];
  // object types within the result
  objectTypes: string[];
  // property for paged results
  pagination?: {
    // number of items per page
    pageSize: number;
    // number of pages available
    pages: number;
    // current page of the result
    page: number;
  };
}

export interface SearchResultItem {
  objectTypeId: string;
  content: SearchResultContent;
  fields: Map<string, any>;
}

export interface SearchResultContent {
  contentStreamId: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export interface SearchQueryProperties {
  term: string;
  types: string[];
  filters: SearchFilter[];
}
