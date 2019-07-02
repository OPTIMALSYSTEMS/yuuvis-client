import { PlatformLocation } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Screen, ScreenService } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { ResponsiveMasterSlaveOptions } from './responsive-master-slave.interface';

/**
 * Component rendering a responsive master-slave-view. It will render master
 * and slave side by side on larger screens. Panes are in this case by default
 * divided by a draggable divider.
 *
 * On small screens either master or slave pane is shown. Using `detailsActive` input
 * will control whether or not the slave pane is visible. Use `slaveClosed` event
 * callback to act upon the slave panel being closed (This should at least reset
 * `detailsActive` input to avoid inconsistancies).
 *
 * ```
 * <yuv-responsive-master-slave [detailsActive]="..." (slaveClosed)="...">
 *    <... class="yuv-master"></...>
 *    <... class="yuv-slave"></...>
 * </<yuv-responsive-master-slave>
 * ```
 *
 * @Input detailsActive: boolean - Indicator whetehr or not to show the slave
 * @Input options: ResponsiveMasterSlaveOptions -
 *   - masterSize: number - Size of the master panel in percent
 *   - slaveSize: number - Size of the slave panel in percent
 *   - direction: 'horizontal' or 'vertical' -
 *   - resizable: boolean
 *
 *
 *
 */
@Component({
  selector: 'yuv-responsive-master-slave',
  templateUrl: './responsive-master-slave.component.html',
  styleUrls: ['./responsive-master-slave.component.sass']
})
export class ResponsiveMasterSlaveComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private _detailsActive: boolean;
  useSmallDeviceLayout: boolean;
  visible = {
    master: true,
    slave: true
  };

  @Input() options: ResponsiveMasterSlaveOptions = {
    masterSize: 60,
    slaveSize: 40,
    direction: 'horizontal',
    resizable: true
  };

  @Input() set detailsActive(a: boolean) {
    this._detailsActive = a;
    if (this.useSmallDeviceLayout && a === true) {
      this.location.pushState({}, '', '');
    }
    this.setPanelVisibility();
  }
  @Output() slaveClosed = new EventEmitter();

  constructor(
    private screenService: ScreenService,
    private location: PlatformLocation
  ) {
    this.subscriptions.push(
      this.screenService.screenChange$.subscribe((screen: Screen) => {
        const useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;
        // if we switch from large to small layout
        if (
          !this.useSmallDeviceLayout &&
          useSmallDeviceLayout &&
          this.detailsActive
        ) {
          this.location.pushState({}, '', '');
        }
        this.useSmallDeviceLayout = useSmallDeviceLayout;
        this.setPanelVisibility();
        if (this.useSmallDeviceLayout) {
          this.location.onPopState(x => {
            this.slaveClosed.emit();
          });
        }
      })
    );
  }

  private setPanelVisibility() {
    if (!this.useSmallDeviceLayout) {
      // large screen mode
      this.visible.slave = true;
      this.visible.master = true;
    } else if (this._detailsActive) {
      // small screen mode with selected item
      this.visible.master = false;
      this.visible.slave = true;
    } else {
      this.visible.master = true;
      this.visible.slave = false;
    }
  }

  // select(items: string[]) {
  //   if (this.useSmallDeviceLayout) {
  //     if (this.selectedItems && items) {
  //       this.location.replaceState({}, '', '');
  //     } else if (!this.selectedItems && items) {
  //       this.location.pushState({}, '', '');
  //     }
  //   }

  //   this.dmsService
  //     .getDmsObjects(items)
  //     .subscribe((dmsObjects: DmsObject[]) => {
  //       this.selectedItems = dmsObjects;
  //     });

  //   // this.selectedItems = items;
  //   this.setPanelVisibility();
  // }

  ngOnInit() {}
}
