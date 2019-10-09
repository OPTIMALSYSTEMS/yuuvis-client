import { Component, Input, OnInit } from '@angular/core';
import { AuditEntry, AuditQueryOptions, AuditService } from '@yuuvis/core';

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
  audits: AuditEntry[] = [];
  busy: boolean;
  range;

  /**
   * ID of the `DmsObject` to list the audits for
   */
  @Input() set objectID(id: string) {
    if (!id) {
      this._objectID = null;
    } else if (!this._objectID || this._objectID !== id) {
      this._objectID = id;
      // load audits
      this.fetchAuditEntries();
    }
  }

  get objectID() {
    return this._objectID;
  }

  constructor(private auditService: AuditService) {}

  private fetchAuditEntries(options?: AuditQueryOptions) {
    this.busy = true;
    this.auditService.getAuditEntries(this._objectID, options).subscribe(
      (res: AuditEntry[]) => {
        this.audits = res;
        this.busy = false;
      },
      err => {
        this.busy = false;
      }
    );
  }

  query() {
    console.log(this.range);
    const options =
      this.range && this.range.length
        ? {
            from: this.range[0],
            to: this.range[1]
          }
        : null;

    this.fetchAuditEntries(options);
  }

  ngOnInit() {}
}
