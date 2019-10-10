import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditQueryOptions, AuditQueryResult, AuditService, TranslateService } from '@yuuvis/core';
import { SVGIcons } from '../../svg.generated';

/**
 * Component listing audits for a given `DmsObject`.
 */
@Component({
  selector: 'yuv-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit {
  private _objectID: string;
  searchForm: FormGroup;
  auditsRes: AuditQueryResult;
  error: boolean;
  busy: boolean;
  searchPanelShow: boolean;
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

  constructor(private auditService: AuditService, private fb: FormBuilder, private translate: TranslateService) {
    this.auditLabels = {
      a100: this.translate.instant('yuv.framework.audit.label.create.metadata'),
      a101: this.translate.instant('yuv.framework.audit.label.create.metadata.withcontent'),

      a200: this.translate.instant('yuv.framework.audit.label.delete'),
      a201: this.translate.instant('yuv.framework.audit.label.delete.content'),
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

    let x = {
      dateRange: []
    };
    Object.keys(this.auditLabels).forEach(k => {
      this.searchActions.push(k);
      x[k] = [false];
    });
    this.searchForm = this.fb.group(x);
  }

  private fetchAuditEntries(options?: AuditQueryOptions) {
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

    let options: AuditQueryOptions = {};
    if (Array.isArray(range) && range.length) {
      (options.from = range[0]), (options.to = range[1]);
    }
    options.actions = this.searchActions.map(a => ({
      action: parseInt(a.substr(1)),
      value: this.searchForm.value[a]
    }));

    this.fetchAuditEntries(options);
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
}
