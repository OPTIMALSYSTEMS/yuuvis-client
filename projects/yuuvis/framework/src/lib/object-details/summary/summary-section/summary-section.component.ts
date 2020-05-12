import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { BaseObjectTypeField, Utils } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { arrowDown } from '../../../svg.generated';
import { SummaryEntry } from '../summary.interface';
/**
 * This low level component is a part of the summary component and consists of separate sections with information about the object
 *  such as `Object attributes`, `Basic parameters` and  `Administrative information`.
 * 
 * [Screenshot](../assets/images/yuv-summary-section.gif)
 * 
 *  @example
 * <yuv-summary-section [id]="'summary.parent'" *ngIf="summary?.parent.length" [visible]="visible.parent"
    [entries]="summary?.parent" [diff]="!!dmsObject2" (visibilityChange)="onSectionVisibilityChange('parent', $event)"
    [label]="'yuv.framework.object-details.summary.section.parent'|translate"></yuv-summary-section>
 */
@Component({
  selector: 'yuv-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss']
})
export class SummarySectionComponent {
  /**
   * whether or not to show a diff in indexdata of the second dmsObject.
   */
  @Input() diff: boolean;

  /**
   * whether or not provide the opportunity to see all versions of the object.
   */
  @Input() set visible(v: boolean) {
    this.isVisible = v;
  }

  /**
   * id of a parent folder. Providing this ID will create the new object
   * inside of parent selected folder such as parent, core, baseparams or admin.
   */
  @Input() id: string;

  /**
   * label provides the names of the section's header and contents.
   */
  @Input() label: string;

  /**
   * entries that should be used for creating object(s).
   */
  @Input() entries: SummaryEntry[];

  /**
   * You may provide a router link config here, that will be applied to an audit entries
   * version number. This way you can add a link to the version pointing to some other
   * state/component dealing with versions of one dms object.
   */
  @Input() versionRouterLink: any[];

  /**
   * check the sections visibility changes.
   */
  @Output() visibilityChange = new EventEmitter<boolean>();

  @HostBinding('class.visible') isVisible: boolean;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([arrowDown]);
  }

  isVersion = (v) => v === BaseObjectTypeField.VERSION_NUMBER;
  isEmpty = (v) => Utils.isEmpty(v);

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
