import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconRegistryService } from '@yuuvis/common-ui';
import { AuditQueryOptions, AuditQueryResult, AuditService, DmsObject, EventService, RangeValue, TranslateService, YuvEvent, YuvEventType } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { arrowNext, search } from '../../svg.generated';

/**
 * Component showing the history of a dms object by listing its audit entries.
 * A search/filter panel is also part of the component so you are able to handle
 * even large numbers of audits.
 *
 * [Screenshot](../assets/images/yuv-audit.gif)
 *
 * @example
 * <yuv-audit [objectID]="'0815'"></yuv-audit>
 */
@Component({
  selector: 'yuv-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit, OnDestroy {
  private _objectID: string;
  searchForm: FormGroup;
  auditsRes: AuditQueryResult;
  searchPanelShow: boolean;
  filtered: boolean;
  error: boolean;
  busy: boolean;
  searchActions: { label: string; actions: string[] }[] = [];

  actionGroups: any = {};
  auditLabels: any = {};

  /**
   * ID of the `DmsObject` to list the audits for
   */
  @Input() set objectID(id: string) {
    if (!id) {
      this._objectID = null;
      this.auditsRes = null;
    } else if (!this._objectID || this._objectID !== id) {
      this._objectID = id;
      // load audits
      this.fetchAuditEntries();
    }
  }

  get objectID() {
    return this._objectID;
  }

  /**
   * You may provide a router link config here, that will be applied to an audit entries
   * version number. This way you can add a link to the version pointing to some other
   * state/component dealing with versions of one dms object.
   */
  @Input() versionRouterLink: any[];

  constructor(
    private auditService: AuditService,
    private eventService: EventService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([search, arrowNext, arrowNext]);
    this.auditLabels = {
      a100: this.translate.instant('yuv.framework.audit.label.create.metadata'),
      a101: this.translate.instant('yuv.framework.audit.label.create.metadata.withcontent'),

      a200: this.translate.instant('yuv.framework.audit.label.delete'),
      a201: this.translate.instant('yuv.framework.audit.label.delete.content'), // #v
      a202: this.translate.instant('yuv.framework.audit.label.delete.marked'),

      a300: this.translate.instant('yuv.framework.audit.label.update.metadata'),
      a301: this.translate.instant('yuv.framework.audit.label.update.content'),
      a302: this.translate.instant('yuv.framework.audit.label.update.metadata.withcontent'),
      a303: this.translate.instant('yuv.framework.audit.label.update.move.content'),

      a400: this.translate.instant('yuv.framework.audit.label.get.content'),
      a401: this.translate.instant('yuv.framework.audit.label.get.metadata'),
      a402: this.translate.instant('yuv.framework.audit.label.get.rendition.text'),
      a403: this.translate.instant('yuv.framework.audit.label.get.rendition.pdf'),
      a404: this.translate.instant('yuv.framework.audit.label.get.rendition.thumbnail')
    };
    const actionKeys = Object.keys(this.auditLabels);
    this.actionGroups = [
      { label: this.translate.instant('yuv.framework.audit.label.group.update'), actions: actionKeys.filter(k => k.startsWith('a3')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.get'), actions: actionKeys.filter(k => k.startsWith('a4')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.delete'), actions: actionKeys.filter(k => k.startsWith('a2')) },
      { label: this.translate.instant('yuv.framework.audit.label.group.create'), actions: actionKeys.filter(k => k.startsWith('a1')) }
    ];

    let fbInput = {
      dateRange: []
    };

    this.actionGroups.forEach(g => {
      const groupEntry = {
        label: g.label,
        actions: g.actions.map(a => {
          fbInput[a] = [false];
          return a;
        })
      };
      this.searchActions.push(groupEntry);
    });
    this.searchForm = this.fb.group(fbInput);

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(takeUntilDestroy(this))
      .subscribe((e: YuvEvent) => {
        const dmsObject = e.data as DmsObject;
        // reload audit entries when update belongs to the current dms object
        if (dmsObject.id === this.objectID) {
          // check if a search is set
          if (this.filtered) {
            this.query();
          } else {
            this.fetchAuditEntries();
          }
        }
      });
  }

  private fetchAuditEntries(options?: AuditQueryOptions) {
    this.error = false;
    this.busy = true;
    this.auditService.getAuditEntries(this._objectID, options).subscribe(
      (res: AuditQueryResult) => {
        this.auditsRes = res;
        this.busy = false;
      },
      err => {
        this.onError();
      }
    );
  }

  /**
   * Execute a query from the search panel.
   */
  query() {
    this.searchForm.value;
    const range: RangeValue = this.searchForm.value.dateRange;

    let options: AuditQueryOptions = {};
    if (range && range.firstValue) {
      options.dateRange = range;
    }
    const actions = [];
    // this.searchActions.forEach(a => {
    Object.keys(this.auditLabels).forEach(a => {
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
    Object.keys(this.auditLabels).forEach(a => {
      patch[a] = null;
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
    actions.forEach(a => {
      if (this.searchForm.value[a] === false) {
        isFalse++;
      } else {
        isTrue++;
      }
    });
    const patch = {};
    actions.forEach(a => {
      patch[a] = isTrue < isFalse;
    });
    this.searchForm.patchValue(patch);
  }

  goToPage(page: number) {
    this.busy = true;
    this.auditService.getPage(this.auditsRes, page).subscribe(
      (res: AuditQueryResult) => {
        this.auditsRes = res;
        this.busy = false;
      },
      err => {
        this.onError();
      }
    );
  }

  private onError() {
    this.busy = false;
    this.auditsRes = null;
    this.error = true;
  }

  ngOnInit() {}
  ngOnDestroy() {}
}
