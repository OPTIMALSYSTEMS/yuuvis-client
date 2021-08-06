import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchFilter, SearchQuery } from '../search/search-query.model';
import { SearchService } from '../search/search.service';
import { AuditField, SystemType } from '../system/system.enum';
import { UserService } from '../user/user.service';
import { AuditQueryOptions, AuditQueryResult } from './audit.interface';
/**
 * Service providing access to the systems audit entries. Audits can be seen as the history of
 * an object. Actions perormed on an object (eg. read, write, delete, ...) will be recorded during
 * the objects lifecycle. Audits are provided based on a users permissions. Beside the audit entries
 * visible to regular users there are more technical ones that will only be shown to users that
 * have administrative role.
 */
@Injectable({
  providedIn: 'root'
})
export class AuditService {
  // default number of items to be fetched
  private DEFAULT_RES_SIZE = 50;

  // audit action codes that should be visible to regular users
  private userAuditActions: number[] = [
    100, // metadata created
    101, // metadata created (with content)
    201, // content deleted
    300, // metadata updated
    301, // content updated
    302, // metadata and content updated
    303 // content moved
  ];
  // audit action codes that should be visible to admin users
  private adminAuditActions: number[] = [
    110, // tag created
    202, // marked for delete
    210, // tag deleted
    310, // tag updated
    400, // content read
    401, // metadata read
    402, // rendition read (text)
    403, // rendition read (pdf)
    404 // rendition read (thumbnail)
  ];

  /**
   * @ignore
   */
  constructor(private searchService: SearchService, private userService: UserService) {}

  /**
   * Get audit entries of a dms object
   */
  getAuditEntries(id: string, options?: AuditQueryOptions): Observable<AuditQueryResult> {
    const q = new SearchQuery();
    q.size = this.DEFAULT_RES_SIZE;
    q.addType(SystemType.AUDIT);
    q.addFilter(new SearchFilter(AuditField.REFERRED_OBJECT_ID, SearchFilter.OPERATOR.EQUAL, id));
    q.sortOptions = [
      {
        field: AuditField.CREATION_DATE,
        order: 'desc'
      }
    ];

    if (!options || !options.allActions) {
      q.addFilter(new SearchFilter(AuditField.ACTION, SearchFilter.OPERATOR.IN, this.getAuditActions(options?.skipActions)));
    }

    if (options) {
      if (options.size) {
        q.size = options.size;
      }
      if (options.dateRange) {
        q.addFilter(new SearchFilter(AuditField.CREATION_DATE, options.dateRange.operator, options.dateRange.firstValue, options.dateRange.secondValue));
      }
      if (options.actions && options.actions.length) {
        q.addFilter(
          new SearchFilter(
            AuditField.ACTION,
            SearchFilter.OPERATOR.IN,
            options.actions.map((a) => a.toString())
          )
        );
      }
    }
    return this.fetchAudits(q);
  }

  /**
   * Get an array of action codes that are provided by the service. Based on
   * whether or not the user has admin permissions you'll get a different
   * set of actions.
   * @param skipActions codes of actions that should not be fetched
   */
  getAuditActions(skipActions?: number[]): number[] {
    return (this.userService.hasAdministrationRoles ? [...this.userAuditActions, ...this.adminAuditActions] : this.userAuditActions).filter(
      (a) => !skipActions || !skipActions.includes(a)
    );
  }

  /**
   * Get a certain page for a former audits query.
   * @param auditsResult The result object of a former audits query
   * @param page The page to load
   */
  getPage(auditsResult: AuditQueryResult, page: number) {
    const q = auditsResult.query;
    q.from = (page - 1) * q.size;
    return this.fetchAudits(q);
  }

  private fetchAudits(q: SearchQuery): Observable<AuditQueryResult> {
    return this.searchService.searchRaw(q).pipe(
      map((res) => ({
        query: q,
        items: res.objects.map((o) => ({
          action: o.properties[AuditField.ACTION].value,
          actionGroup: this.getActionGroup(o.properties[AuditField.ACTION].value),
          detail: o.properties[AuditField.DETAIL].value,
          version: o.properties[AuditField.VERSION].value,
          creationDate: o.properties[AuditField.CREATION_DATE].value,
          createdBy: {
            id: o.properties[AuditField.CREATED_BY].value,
            title: o.properties[AuditField.CREATED_BY].title
          }
        })),
        hasMoreItems: res.hasMoreItems,
        page: !q.from ? 1 : q.from / q.size + 1
      }))
    );
  }

  private getActionGroup(action: number): number {
    try {
      return parseInt(`${action}`.substr(0, 1));
    } catch {
      return -1;
    }
  }
}
