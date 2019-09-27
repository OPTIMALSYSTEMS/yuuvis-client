import { Component, Input, OnInit } from '@angular/core';
import { AuditEntry, DmsService } from '@yuuvis/core';

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

  constructor(private dmsService: DmsService) {}

  private fetchAuditEntries() {
    this.dmsService.getAuditEntries(this._objectID).subscribe((res: AuditEntry[]) => {});
  }

  ngOnInit() {}
}
