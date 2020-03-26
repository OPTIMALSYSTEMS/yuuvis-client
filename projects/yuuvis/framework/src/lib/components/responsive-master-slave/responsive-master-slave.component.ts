import { Component, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { Screen, ScreenService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
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
 ```html
 <yuv-responsive-master-slave [slaveActive]="..." (slaveClosed)="...">
    <... class="yuv-master"></...>
    <... class="yuv-slave"></...>
 </<yuv-responsive-master-slave>
 ```
 */
@Component({
  selector: 'yuv-responsive-master-slave',
  templateUrl: './responsive-master-slave.component.html',
  styleUrls: ['./responsive-master-slave.component.scss']
})
export class ResponsiveMasterSlaveComponent implements OnDestroy {
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
    masterMinSize: 0,
    slaveSize: 60,
    slaveMinSize: 0,
    direction: 'vertical',
    resizable: true,
    useStateLayout: false
  };

  _layoutOptions: ResponsiveMasterSlaveOptions = {};

  @HostBinding('class.yuv-responsive-master-slave') _hostClass = true;
  @HostBinding('class.slaveActive') _slaveActive: boolean;

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  private _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(lok: string) {
    this._layoutOptionsKey = lok;
    this.layoutService.loadLayoutOptions(lok, 'yuv-responsive-master-slave').subscribe((o: ResponsiveMasterSlaveOptions) => {
      this.setDirection(o);
    });
  }

  @Input() set slaveActive(a: boolean) {
    this._slaveActive = !!a;
    this.visible.slave = this._slaveActive;
  }
  get slaveActive() {
    return this._slaveActive;
  }
  @Output() slaveClosed = new EventEmitter();

  constructor(private screenService: ScreenService, private layoutService: LayoutService) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.useSmallDeviceLayout = screen.isSmall;
      this.setDirection(this._layoutOptions);
    });
  }

  private setDirection(options: ResponsiveMasterSlaveOptions) {
    const direction = this.useSmallDeviceLayout ? 'vertical' : options ? options.direction : 'horizontal';
    this._layoutOptions = {
      ...(direction === 'vertical' ? this.verticalOptions : this.horizontalOptions),
      ...(options && direction === options.direction ? options : {})
    };
  }

  closeSlave() {
    this.slaveClosed.emit();
  }

  gutterDblClick() {
    this._layoutOptions.direction = this._layoutOptions.direction === 'vertical' ? 'horizontal' : 'vertical';
    this.setDirection(this._layoutOptions);
    this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-master-slave', this._layoutOptions).subscribe();
  }

  dragEnd(evt: any) {
    this._layoutOptions.masterSize = evt.sizes[0];
    this._layoutOptions.slaveSize = evt.sizes[1];
    this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-master-slave', this._layoutOptions).subscribe();
  }

  ngOnDestroy() {}
}
