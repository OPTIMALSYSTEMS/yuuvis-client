import { RangeValue } from '../../model/range-value.model';
import { SearchQuery } from '../search/search-query.model';

/**
 * Is a part of `AuditQueryResult` interface
 */
export interface AuditEntry {
  action: number;
  actionGroup: number;
  detail: string;
  creationDate: Date;
  version: number;
  createdBy: {
    id: string;
    title: string;
  };
}
/**
 * Interface for a result object of a former audits query
 */
export interface AuditQueryResult {
  /**
   * the original query, needed for later on paging requests
   */

  query: SearchQuery;
  items: AuditEntry[];
  hasMoreItems: boolean;
  /**
   * the page of the current result (in case of multi-page results, otherwise 1)
   */
  page: number;
}

export interface AuditQueryOptions {
  /**
   * max number of items to be fetched (default: 50)
   */
  size?: number;
  dateRange?: RangeValue;
  actions?: AuditQueryOptionAction[];
}

/**
 * is a part of `AuditQueryOptions` interface
 */
export interface AuditQueryOptionAction {
  action: number;
  value: boolean;
}
