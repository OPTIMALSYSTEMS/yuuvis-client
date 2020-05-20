import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { clear } from './../../svg.generated';

/**
 * Component rendering a panel. Panels contain at least by a header
 * and a content section. But it could also contain a footer. Define the
 * actual content of each section by providing classes to child elements.
 *
 * [Screenshot](../assets/images/yuv-panel.gif)
 *
 * @example
 * <yuv-panel [title]="'My Panel'" [description]="'some description'">
 *   <div class="header">
 *
 *   <yuv-icon class="header-icon" icon="favorite" *ngIf="showIcon"></yuv-icon>
 *
 *   <yuv-action-menu-bar class="actions" *ngIf="showActions">
 *     <yuv-icon class="btn" icon="refresh"></yuv-icon>
 *     <yuv-icon class="btn" icon="kebap"></yuv-icon>
 *   </yuv-action-menu-bar>
 *
 *   </div>
 *   <div class="content">Main content section</div>
 *   <div class="footer">Footer content section</div>
 * </yuv-panel>
 */
@Component({
  selector: 'yuv-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  host: { class: 'yuv-panel-wrapper' }
})
export class PanelComponent implements OnInit {
  @Input() title = '';
  @Input() description = '';
  @Output() titleClick = new EventEmitter();

  @HostBinding('class.titleClickable') _titleClickable: boolean;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear]);
  }

  ngOnInit() {
    this._titleClickable = !!this.titleClick.observers.length;
  }
}
