import { Component, EventEmitter, HostBinding, Inject, Input, Output } from '@angular/core';
import { BaseObjectTypeField, Utils } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { ROUTES, YuvRoutes } from '../../../Routing/Routes';
import { arrowDown } from '../../../svg.generated';
import { SummaryEntry } from '../summary.interface';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss']
})
export class SummarySectionComponent {
  versionStatePath: string;
  versionStateQueryParam: string;

  @Input() diff: boolean;

  @Input() set visible(v: boolean) {
    this.isVisible = v;
  }

  @Input() id: string;

  @Input() dmsObjectID: string;

  @Input() label: string;

  @Input() entries: SummaryEntry[];

  @Output() visibilityChange = new EventEmitter<boolean>();

  @HostBinding('class.visible') isVisible: boolean;

  constructor(private iconRegistry: IconRegistryService, @Inject(ROUTES) private routes: YuvRoutes) {
    this.iconRegistry.registerIcons([arrowDown]);
    this.versionStatePath = this.routes && this.routes.versions ? this.routes.versions.path : null;
    this.versionStateQueryParam = this.routes && this.routes.versions ? this.routes.versions.queryParams.version : null;
  }

  isVersion = (v) => v === BaseObjectTypeField.VERSION_NUMBER;
  isEmpty = (v) => Utils.isEmpty(v);

  getVersionStateQueryParams(version) {
    let params = {};
    if (this.versionStateQueryParam) {
      params[this.versionStateQueryParam] = version;
    }
    return params;
  }

  classes = (v1, v2) => ({
    entry: true,
    diffActive: this.diff,
    new: this.diff && this.isEmpty(v1) && !this.isEmpty(v2),
    removed: this.diff && !this.isEmpty(v1) && this.isEmpty(v2),
    modified: this.diff && !this.isEmpty(v1) && !this.isEmpty(v2)
  });

  toggle() {
    this.visibilityChange.emit(!this.isVisible);
  }
}
