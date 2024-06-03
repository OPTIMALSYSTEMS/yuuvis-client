import { AfterViewInit, Component, EventEmitter, HostBinding, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Screen, ScreenService } from '@yuuvis/core';
import { SplitComponent } from 'angular-split';
import { LayoutService } from '../../services/layout/layout.service';
import { ResponsiveMasterSlaveOptions } from './responsive-master-slave.interface';

/**
 * Component rendering a responsive master-slave-view. It will render master
 * and slave side by side on larger screens. Panes are in this case by default
 * divided by a draggable divider.
 *
 * On small screens either master or slave pane is shown. Using `slaveActive` input
 * will control whether or not the slave pane is visible. Use `slaveClosed` event
 * callback to act upon the slave panel being closed (This should at least reset
 * `slaveActive` input to avoid inconsistancies).
 * 
 * [Screenshot](../assets/images/yuv-responsive-master-slave.gif)
 * 
 * @example
 *  <yuv-responsive-master-slave [slaveActive]="..." (slaveClosed)="...">
    <... class="yuv-master"></...>
    <... class="yuv-slave"></...>
 </yuv-responsive-master-slave>

 */
@Component({
  selector: 'yuv-responsive-master-slave',
  templateUrl: './responsive-master-slave.component.html',
  styleUrls: ['./responsive-master-slave.component.scss']
})
export class ResponsiveMasterSlaveComponent implements OnDestroy, AfterViewInit {
  @ViewChild(SplitComponent) splitEl: SplitComponent;
  useSmallDeviceLayout: boolean;
  visible = {
    master: true,
    slave: false
  };

  private horizontalOptions: ResponsiveMasterSlaveOptions = {
    masterSize: 60,
    masterMinSize: 20,
    slaveSize: 40,
    slaveMinSize: 30,
    direction: 'horizontal',
    resizable: true,
    useStateLayout: false
  };

  private verticalOptions: ResponsiveMasterSlaveOptions = {
    masterSize: 40,
    masterMinSize: 30,
    slaveSize: 60,
    slaveMinSize: 40,
    direction: 'vertical',
    resizable: true,
    useStateLayout: false
  };

  _layoutOptions: ResponsiveMasterSlaveOptions = {};
  _direction: any;

  @HostBinding('class.yuv-responsive-master-slave') _hostClass = true;
  @HostBinding('class.slaveActive') _slaveActive: boolean;

  private _layoutOptionsKey: string;

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() set layoutOptionsKey(lok: string) {
    this._layoutOptionsKey = lok;
    this.layoutService.loadLayoutOptions(lok, 'yuv-responsive-master-slave').subscribe((o: ResponsiveMasterSlaveOptions) => {
      this.setDirection(o?.direction, o);
    });
  }
  /**
   * Control whether or not the slave pane is visible.
   */
  @Input() set slaveActive(a: boolean) {
    this._slaveActive = !!a;
    this.visible.slave = this._slaveActive;
  }
  get slaveActive() {
    return this._slaveActive;
  }

  /**
   * Emittet when the slave panel has been closed.
   *
   */

  @Output() slaveClosed = new EventEmitter();

  constructor(private screenService: ScreenService, private layoutService: LayoutService, private ngZone: NgZone) {
    this.screenService.screenChange$.pipe(takeUntilDestroyed()).subscribe((screen: Screen) => {
      const maximize = this.useSmallDeviceLayout === true && !screen.isSmall;
      this.useSmallDeviceLayout = screen.isSmall;
      this.setDirection(maximize ? 'horizontal' : this._direction, this._layoutOptions);
    });
  }

  private setDirection(_direction: 'vertical' | 'horizontal', options: ResponsiveMasterSlaveOptions) {
    this._direction = _direction || 'horizontal';
    const direction = this.useSmallDeviceLayout ? 'vertical' : this._direction;
    this._layoutOptions = {
      ...(direction === 'vertical' ? this.verticalOptions : this.horizontalOptions),
      ...(options && direction === options.direction ? options : {})
    };
  }

  private saveOptions() {
    const { masterSize, slaveSize, direction } = this._layoutOptions;
    this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-master-slave', { masterSize, slaveSize, direction }).subscribe();
  }

  closeSlave() {
    this.slaveClosed.emit();
  }

  gutterDblClick() {
    const direction = this.useSmallDeviceLayout || this._layoutOptions.direction === 'horizontal' ? 'vertical' : 'horizontal';
    this.setDirection(direction, this._layoutOptions);
    this.saveOptions();
  }

  dragEnd(evt: any) {
    this._layoutOptions.masterSize = evt.sizes[0];
    this._layoutOptions.slaveSize = evt.sizes[1];
    if (evt.sizes.every((s) => s > 0)) {
      this.saveOptions();
    }
  }

  ngAfterViewInit() {
    this.splitEl?.dragProgress$.pipe(takeUntilDestroyed()).subscribe((x) => {
      const { masterMinSize, slaveMinSize } = this._layoutOptions;
      if (x.sizes[0] as number < masterMinSize) {
        // automatic collapse/expand of master area
        this.splitEl.displayedAreas[0].size = x.sizes[0] as number > masterMinSize / 2 ? masterMinSize : 0;
        this.splitEl.displayedAreas[1].size = 100 - this.splitEl.displayedAreas[0].size;
        this.splitEl['refreshStyleSizes']();
      } else if (x.sizes[1] as number < slaveMinSize) {
        // automatic collapse/expand of slave area
        this.splitEl.displayedAreas[0].size = x.sizes[1] as number > slaveMinSize / 2 ? 100 - slaveMinSize : 100;
        this.splitEl.displayedAreas[1].size = 100 - this.splitEl.displayedAreas[0].size;
        this.splitEl['refreshStyleSizes']();
      }
    });
  }

  ngOnDestroy() { }
}
