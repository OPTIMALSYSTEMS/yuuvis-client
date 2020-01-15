import { DmsObjectRights } from '../../model/dms-object.interface';

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
  options?: { rights: DmsObjectRights };
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
  aggregations: Aggregation[];
}

export interface Aggregation {
  aggKey: string;
  entries: {
    key: string;
    count: number;
  }[];
}
