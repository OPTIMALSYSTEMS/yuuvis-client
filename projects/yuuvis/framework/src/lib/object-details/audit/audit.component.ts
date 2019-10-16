import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditQueryOptions, AuditQueryResult, AuditService, DmsObject, EventService, TranslateService, YuvEvent, YuvEventType } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { SVGIcons } from '../../svg.generated';

/**
 * Component listing audits for a given `DmsObject`.
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
  searchActions: string[] = [];

  icon = {
    search: SVGIcons['search'],
    arrowNext: SVGIcons['arrow-next'],
    arrowLast: SVGIcons['arrow-last']
  };
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

  constructor(private auditService: AuditService, private eventService: EventService, private fb: FormBuilder, private translate: TranslateService) {
    this.auditLabels = {
      a100: this.translate.instant('yuv.framework.audit.label.create.metadata'),
      a101: this.translate.instant('yuv.framework.audit.label.create.metadata.withcontent'),

      a200: this.translate.instant('yuv.framework.audit.label.delete'),
      a201: this.translate.instant('yuv.framework.audit.label.delete.content'), // #v
      a202: this.translate.instant('yuv.framework.audit.label.delete.marked'),

      a300: this.translate.instant('yuv.framework.audit.label.update.metadata'),
      a301: this.translate.instant('yuv.framework.audit.label.update.content'),
      a302: this.translate.instant('yuv.framework.audit.label.update.metadata.withcontent'),

      a400: this.translate.instant('yuv.framework.audit.label.get.content'),
      a401: this.translate.instant('yuv.framework.audit.label.get.metadata'),
      a402: this.translate.instant('yuv.framework.audit.label.get.rendition.text'),
      a403: this.translate.instant('yuv.framework.audit.label.get.rendition.pdf'),
      a404: this.translate.instant('yuv.framework.audit.label.get.rendition.thumbnail')
    };

    let fbInput = {
      dateRange: [],
      createdBy: ['']
    };
    Object.keys(this.auditLabels).forEach(k => {
      this.searchActions.push(k);
      fbInput[k] = [false];
    });
    this.searchForm = this.fb.group(fbInput);

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(takeUntilDestroy(this))
      .subscribe((e: YuvEvent) => {
        const dmsObject = e.data as DmsObject;
        // reload audit entries when update belongs to the current dms object
        if (dmsObject.id === this.objectID) {
          this.fetchAuditEntries();
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

  query() {
    this.searchForm.value;

    const range = this.searchForm.value.dateRange;
    const createdBy = this.searchForm.value.createdBy;

    let options: AuditQueryOptions = {};
    if (Array.isArray(range) && range.length) {
      options.from = range[0];
      options.to = range[1];
    }
    if (createdBy && createdBy.length) {
      options.createdBy = createdBy;
    }
    const actions = [];
    this.searchActions.forEach(a => {
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
