import { PlatformLocation } from '@angular/common';
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
 * ```
 * <yuv-responsive-master-slave [detailsActive]="..." (slaveClosed)="...">
 *    <... class="yuv-master"></...>
 *    <... class="yuv-slave"></...>
 * </<yuv-responsive-master-slave>
 * ```
 *
 * # Inputs
 * ## detailsActive (boolean)
 * Condition when to show the details panel. This only affects the rendering
 * on small screen devices as there the slave pane will be rendered on top
 * of the master panel once the condition is true.
 *
 * ## options (ResponsiveMasterSlaveOptions)
 * Using options input you can configure how the component should behave.
 * Available options are:
 *
 * ### masterSize: number
 * Size (width or height depending on the direction settings) of the master panel in percent (default: 60)
 *
 * ### slaveSize: number
 * Size (width or height depending on the direction settings) of the slave panel in percent (default: 40)
 *
 * ### direction: 'horizontal' or 'vertical'
 * Sets how to layout master and slave pane. Defaults to 'horizontal'.
 *
 * ### resizable: boolean
 * Indicator whether or not the panels could be resized. By default you are able to drag the divider
 * between master and slave panel to resize both of them.
 *
 * ### useStateLayout: boolean
 * Using state layout means that the component is used as the base layout of a state view. This will
 * apply some classes to the components and its panels. It will setup a padding to the component itself
 * and apply a default panel style (white background and slight shadow) to master and slave component.
 *
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
    slave: true
  };

  private _options: ResponsiveMasterSlaveOptions = {
    masterSize: 60,
    masterMinSize: 20,
    slaveSize: 40,
    slaveMinSize: 30,
    direction: 'horizontal',
    resizable: true,
    useStateLayout: false
  };

  @HostBinding('class.yuv-responsive-master-slave') _hostClass = true;
  @HostBinding('class.detailsActive') _detailsActive: boolean;

  @Input() set options(o: ResponsiveMasterSlaveOptions) {
    this._options = { ...this._options, ...o };
  }
  get options(): ResponsiveMasterSlaveOptions {
    return this._options;
  }
  @Input() set detailsActive(a: boolean) {
    this._detailsActive = a;
    this.setPanelVisibility();
  }
  get detailsActive() {
    return this._detailsActive;
  }
  @Output() slaveClosed = new EventEmitter();
  @Output() optionsChanged = new EventEmitter();

  constructor(private screenService: ScreenService, private location: PlatformLocation) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      const useSmallDeviceLayout = screen.mode === ScreenService.MODE.SMALL;
      this.useSmallDeviceLayout = useSmallDeviceLayout;
      this.setPanelVisibility();
    });
  }

  private setPanelVisibility() {
    if (!this.useSmallDeviceLayout) {
      // large screen mode
      this.visible.master = true;
      this.visible.slave = !!this._detailsActive;
    } else if (!!this._detailsActive) {
      // small screen mode with selected item
      this.visible.master = false;
      this.visible.slave = true;
    } else {
      this.visible.master = true;
      this.visible.slave = false;
    }
  }

  closeSlave() {
    this.slaveClosed.emit();
  }

  dragEnd(evt: any) {
    const options = { masterSize: evt.sizes[0], slaveSize: evt.sizes[1] };
    this.options = options;
    this.optionsChanged.emit(options);
  }

  ngOnInit() {}
  ngOnDestroy() {}
}
