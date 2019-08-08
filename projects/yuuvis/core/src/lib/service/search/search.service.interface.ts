import { SearchFilter } from './search-query.model';

export interface SearchResult {
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
  repositoryId: string;
  digest: string;
  fileName: string;
  size: number;
  archivePath: string;
  range: string;
  mimeType: string;
}

export interface SearchQueryProperties {
  term: string;
  from?: number;
  maxItems?: number;
  types: string[];
  filters: SearchFilter[];
}
