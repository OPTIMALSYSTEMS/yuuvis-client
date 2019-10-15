export interface SearchResult {
  hasMoreItems: boolean;
  totalNumItems: number;
  items: SearchResultItem[];
  // object types within the result
  objectTypes: string[];
}

export interface SearchResultItem {
  objectTypeId: string;
  content?: SearchResultContent;
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
  term?: string;
  size?: number;
  from?: number;
  aggs?: string[];
  maxItems?: number;
  types?: string[];
  filters?: any;
  sort?: any;
}

export interface AggregateResult {
  totalNumItems: number;
  aggregations: {
    key: string;
    count: number;
  }[];
}
