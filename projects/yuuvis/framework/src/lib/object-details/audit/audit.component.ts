import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AuditQueryOptions,
  AuditQueryResult,
  AuditService,
  DmsObject,
  EventService,
  RangeValue,
  SystemService,
  TranslateService,
  YuvEvent,
  YuvEventType
} from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ROUTES, YuvRoutes } from '../../routing/routes';
import { arrowNext, filter } from '../../svg.generated';

/**
 * Component showing the history of a dms object by listing its audit entries.
 * A search/filter panel is also part of the component so you are able to handle
 * even large numbers of audits.
 *
 * [Screenshot](../assets/images/yuv-audit.gif)
 *
 * @example
 * <yuv-audit [objectID]="'0815'"></yuv-audit>
 *
 * <!-- skipping certain action codes -->
 * <yuv-audit [objectID]="'0815'" [skipActions]="[100, 200, 202]"></yuv-audit>
 */
@Component({
  selector: 'yuv-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit, OnDestroy {
  private _objectID: string;
  private _objectTypeID: string;
  private initialFetch: boolean;
  searchForm: FormGroup;
  auditsRes: AuditQueryResult;
  searchPanelShow: boolean;
  filtered: boolean;
  error: boolean;
  busy: boolean;
  searchActions: { label: string; actions: string[] }[] = [];
  versionStatePath: string;
  versionStateQueryParam: string;

  actionGroups: any = {};
  auditLabels: any = {};

  @Input() set dmsObject(o: DmsObject) {
    if (!o) {
      this._objectID = null;
      this._objectTypeID = null;
      this.auditsRes = null;
    } else if (!this._objectID || this._objectID !== o.id) {
      this._objectID = o.id;
      this._objectTypeID = o.objectTypeId;
      if (this.initialFetch) {
        this.query();
      }
    } else {
      this.query();
    }
  }

  /**
   * A list of audits that should not be shown. Use the audit codes (like 100, 301, etc.).
   * This will also disable the corresponding filters.
   */
  @Input() skipActions: number[];

  /**
   * Whether or not to ignore admin and user separation of audit entries
   */
  @Input() allActions: boolean;

  get objectID() {
    return this._objectID;
  }

  constructor(
    private auditService: AuditService,
    private eventService: EventService,
    private system: SystemService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    @Inject(ROUTES) private routes: YuvRoutes
  ) {
    this.versionStatePath = this.routes && this.routes.versions ? this.routes.versions.path : null;
    this.versionStateQueryParam = this.routes && this.routes.versions ? this.routes.versions.queryParams.version : null;
    this.iconRegistry.registerIcons([filter, arrowNext, arrowNext]);
    this.auditLabels = {
      a100: this.translate.instant('yuv.framework.audit.label.create.metadata'),
      a101: this.translate.instant('yuv.framework.audit.label.create.metadata.withcontent'),
      a110: this.translate.instant('yuv.framework.audit.label.create.tag'),

      a200: this.translate.instant('yuv.framework.audit.label.delete'),
      a201: this.translate.instant('yuv.framework.audit.label.delete.content'), // #v
      a202: this.translate.instant('yuv.framework.audit.label.delete.marked'),
      a210: this.translate.instant('yuv.framework.audit.label.delete.tag'), // #v

      a300: this.translate.instant('yuv.framework.audit.label.update.metadata'),
      a301: this.translate.instant('yuv.framework.audit.label.update.content'),
      a302: this.translate.instant('yuv.framework.audit.label.update.metadata.withcontent'),
      a303: this.translate.instant('yuv.framework.audit.label.update.move.content'),
      a310: this.translate.instant('yuv.framework.audit.label.update.tag'),
      a325: this.translate.instant('yuv.framework.audit.label.update.restore'),

      a400: this.translate.instant('yuv.framework.audit.label.get.content'),
      a401: this.translate.instant('yuv.framework.audit.label.get.metadata'),
      a402: this.translate.instant('yuv.framework.audit.label.get.rendition.text'),
      a403: this.translate.instant('yuv.framework.audit.label.get.rendition.pdf'),
      a404: this.translate.instant('yuv.framework.audit.label.get.rendition.thumbnail'),

      a1000: this.translate.instant('yuv.framework.audit.label.get.custom')
    };

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(takeUntilDestroy(this))
      .subscribe((e: YuvEvent) => {
        const dmsObject = e.data as DmsObject;
        // reload audit entries when update belongs to the current dms object
        if (dmsObject.id === this.objectID) {
          this.query();
        }
      });
  }

  private fetchAuditEntries(options?: AuditQueryOptions) {
    this.error = false;
    this.busy = true;

    if (!options) options = {};
    if (this.skipActions && this.skipActions.length) {
      options.skipActions = this.skipActions;
    }
    options.allActions = !!this.allActions;

    this.auditService.getAuditEntries(this._objectID, this._objectTypeID, options).subscribe(
      (res: AuditQueryResult) => {
        this.auditsRes = this.mapResult(res);
        this.busy = false;
      },
      (err) => {
        this.onError();
      }
    );
  }

  private mapResult(res: AuditQueryResult): AuditQueryResult {
    res.items.forEach((i) => {
      // tag related audits
      if ([110, 210, 310].includes(i.action)) {
        const m = i.detail.match(/\[(.*?)\]/);
        if (m && m[1]) {
          const t = m[1].split(',');
          i.more = `
          ${this.system.getLocalizedResource(t[0].trim() + '_label')}: ${this.system.getLocalizedResource(`${t[0].trim()}:${t[1].trim()}_label`)}
          `;
        }
      }
    });
    return res;
  }

  /**
   * Execute a query from the search panel.
   */
  query() {
    const range: RangeValue = this.searchForm.value.dateRange;

    let options: AuditQueryOptions = {};
    if (range && range.firstValue) {
      options.dateRange = range;
    }
    const actions = [];
    Object.keys(this.auditLabels).forEach((a) => {
      if (this.searchForm.value[a]) {
        actions.push(parseInt(a.substr(1)));
      }
    });

    if (actions.length) {
      options.actions = actions;
    }
    this.filtered = Object.keys(options).length > 0;
    this.fetchAuditEntries(options);
    this.closeSearchPanel();
  }

  openSearchPanel() {
    this.searchPanelShow = true;
  }
  closeSearchPanel() {
    this.searchPanelShow = false;
  }
  resetSearchPanel() {
    const patch = {
      dateRange: null
    };
    Object.keys(this.auditLabels).forEach((a) => {
      // exclude read actions
      patch[a] = a.startsWith('a4') ? false : true;
    });
    this.searchForm.patchValue(patch);
    this.filtered = false;
  }

  /**
   * Toggle selection of a whole group
   * @param actions affected actions
   */
  toggleGroupActions(actions: string[]) {
    let isTrue = 0;
    let isFalse = 0;
    actions.forEach((a) => {
      if (this.searchForm.value[a] === false) {
        isFalse++;
      } else {
        isTrue++;
      }
    });
    const patch = {};
    actions.forEach((a) => {
      patch[a] = isTrue < isFalse;
    });
    this.searchForm.patchValue(patch);
  }

  goToPage(page: number) {
    this.busy = true;
    this.auditService.getPage(this.auditsRes, page).subscribe(
      (res: AuditQueryResult) => {
        this.auditsRes = this.mapResult(res);
        this.busy = false;
      },
      (err) => {
        this.onError();
      }
    );
  }

  getVersionStateQueryParams(version) {
    let params = {};
    if (this.versionStateQueryParam) {
      params[this.versionStateQueryParam] = version;
    }
    return params;
  }

  private onError() {
    this.busy = false;
    this.auditsRes = null;
    this.error = true;
  }

  ngOnInit() {
    let actionKeys = this.auditService.getAuditActions(this.allActions).map((a: number) => `a${a}`);
    // let actionKeys = Object.keys(this.auditLabels);
    if (this.skipActions) {
      const skipActionKeys = this.skipActions.map((a) => `a${a}`);
      actionKeys = actionKeys.filter((k) => !skipActionKeys.includes(k));
    }
    this.actionGroups = [
      { label: this.translate.instant('yuv.framework.audit.label.group.update'), actions: actionKeys.filter((k) => k.startsWith('a3')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.get'), actions: actionKeys.filter((k) => k.startsWith('a4')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.delete'), actions: actionKeys.filter((k) => k.startsWith('a2')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.create'), actions: actionKeys.filter((k) => k.startsWith('a1')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.custom'), actions: actionKeys.filter((k) => k.startsWith('a1000')) }
    ];

    let fbInput = {
      dateRange: []
    };
    this.actionGroups.forEach((g) => {
      if (g.actions.length) {
        const groupEntry = {
          label: g.label,
          actions: g.actions.map((a) => {
            fbInput[a] = [a.startsWith('a4') ? false : true];
            return a;
          })
        };
        this.searchActions.push(groupEntry);
      }
    });
    this.searchForm = this.fb.group(fbInput);
    if (!this.initialFetch) {
      this.query();
      this.initialFetch = true;
    }
  }
  ngOnDestroy() {}
}
