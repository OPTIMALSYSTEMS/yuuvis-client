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
  more?: string;
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
  /**
   * Data range to search within
   */
  dateRange?: RangeValue;
  /**
   * List of actions (codes) to restricts the audits to
   */
  actions?: string[];
  /**
   * Actions that should explicitly NOT be fetched
   */
  skipActions?: number[];
  /**
   * Whether or not to query all audit entries, without the user
   * or admin filter conditions
   */
  allActions?: boolean;
}
