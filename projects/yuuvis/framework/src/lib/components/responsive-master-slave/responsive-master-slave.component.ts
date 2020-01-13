import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Screen, ScreenService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { SVGIcons } from '../../svg.generated';
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
 ```html
 <yuv-responsive-master-slave [detailsActive]="..." (slaveClosed)="...">
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
export class ResponsiveMasterSlaveComponent implements OnInit, OnDestroy {
  backButton = SVGIcons.navBack;
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

  private _options: ResponsiveMasterSlaveOptions = {};

  @HostBinding('class.yuv-responsive-master-slave') _hostClass = true;
  @HostBinding('class.detailsActive') _detailsActive: boolean;

  /**
   * Using options input you can configure how the component should behave.
   * Available options are:
   *
   * - **masterSize:** Size (width or height depending on the direction settings) of the master panel in percent (default: 60)
   * - **slaveSize:** Size (width or height depending on the direction settings) of the slave panel in percent (default: 40)
   * - **direction:** Sets how to layout master and slave pane ('horizontal' or 'vertical'). Defaults to 'horizontal'.
   * - **resizable:** Indicator whether or not the panels could be resized. By default you are able to drag the divider between master and slave panel to resize both of them.
   * - **useStateLayout:** Using state layout means that the component is used as the base layout of a state view. This will apply some classes to the components and its panels. It will setup a padding to the component itself and apply a default panel style (white background and slight shadow) to master and slave component.
   */
  @Input() set options(o: ResponsiveMasterSlaveOptions) {
    const direction = this.useSmallDeviceLayout ? 'vertical' : o.direction || 'horizontal';
    this._options = { ...(direction === 'vertical' ? this.verticalOptions : this.horizontalOptions), ...(direction === o.direction ? o : {}) };
    const { masterSize, slaveSize } = this.options;
    this.optionsChanged.emit({ masterSize, slaveSize, direction });
  }
  get options(): ResponsiveMasterSlaveOptions {
    return this._options;
  }
  @Input() set detailsActive(a: boolean) {
    this._detailsActive = !!a;
    this.visible.slave = this._detailsActive;
  }
  get detailsActive() {
    return this._detailsActive;
  }
  @Output() slaveClosed = new EventEmitter();
  @Output() optionsChanged = new EventEmitter();

  constructor(private screenService: ScreenService) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.useSmallDeviceLayout = screen.isSmall;
      // update options based on layout
      this.options = { direction: this.options.direction };
    });
  }

  closeSlave() {
    this.slaveClosed.emit();
  }

  gutterDblClick() {
    this.options = { direction: this.options.direction === 'vertical' ? 'horizontal' : 'vertical' };
  }

  dragEnd(evt: any) {
    this.options = { masterSize: evt.sizes[0], slaveSize: evt.sizes[1], direction: this.options.direction };
  }

  ngOnInit() {}
  ngOnDestroy() {}
}
