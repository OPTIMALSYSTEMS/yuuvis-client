import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { Screen, ScreenService } from '@yuuvis/core';
import { TabPanel, TabView } from 'primeng/tabview';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { verticalSplit } from './../../svg.generated';
/**
 * Responsive Split TabContainer + plugin support
 */
@Component({
  selector: 'yuv-responsive-tab-container',
  templateUrl: './responsive-tab-container.component.html',
  styleUrls: ['./responsive-tab-container.component.scss']
})
export class ResponsiveTabContainerComponent implements OnInit, AfterContentInit {
  /**
   * TabPanel plugins
   */
  @Input() pluginPanels = new QueryList<TabPanel>();

  private _options = { panelOrder: [], panelSizes: [] };

  @Input() set options(opt) {
    this._options = { ...this._options, ...opt };
  }

  get options() {
    return this._options;
  }

  @ContentChildren(TabPanel) tabPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewTabPanels: QueryList<TabPanel>;

  @ViewChild('mainTabView', { static: true }) mainTabView: TabView;
  @ViewChildren('splitTabView') splitTabViews: QueryList<TabView>;

  @Output() optionsChanged = new EventEmitter();

  allPanels: TabPanel[] = [];
  splitPanels: TabPanel[] = [];
  orientation = 'top';
  isSmallScreen$: Observable<boolean>;
  isBigScreen: Observable<boolean>;

  constructor(private screenService: ScreenService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([verticalSplit]);
  }

  /**
   * add SplitPanel with specific TabPanel
   * @param id TabPanel id
   */
  splitPanelAdd(id?: string) {
    const panel = id ? this.allPanels.find(p => this.pID(p) === id) : this.mainTabView.findSelectedTab();
    if (panel && this.allPanels.length > this.splitPanels.length + 1) {
      panel.loaded = true;
      panel.disabled = true;
      this.splitPanels.push(panel);
      setTimeout(
        () =>
          this.movePanelContent(
            panel,
            this.splitTabViews.find(v => this.pID(v.tabPanels.first) === this.pID(panel, '_empty'))
          ),
        100
      );
      if (!id) {
        this.open(this.allPanels.find(p => !p.selected && !p.disabled));
      }
    }
  }

  /**
   * remove SplitPanel with specific TabPanel
   * @param panel TabPanel
   * @param index SplitPanel index
   */
  splitPanelClose(panel: TabPanel, index = 0) {
    this.movePanelContent(panel);
    panel.disabled = false;
    this.splitPanels.splice(index, 1);
    this.savePanelOrder();
  }

  private movePanelContent(panel: TabPanel, tabView: TabView = this.mainTabView) {
    tabView.el.nativeElement.firstElementChild.lastElementChild.appendChild(panel.viewContainer.element.nativeElement);
  }

  /**
   * custom event handler
   * @param e
   */
  onChange(e: any) {
    if (e && e.originalEvent) {
      e.originalEvent.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    this.savePanelOrder();
  }

  ngOnInit() {
    this.isSmallScreen$ = this.screenService.screenChange$.pipe(
      map((screen: Screen) => screen.mode === ScreenService.MODE.SMALL),
      tap(isSmall => isSmall && [...this.splitPanels].forEach(p => this.splitPanelClose(p)))
    );

    this.isBigScreen = this.isSmallScreen$.pipe(
      take(1),
      filter(isSmall => !isSmall)
    );
  }

  ngAfterContentInit() {
    // timeout to run init after ngAfterContentInit of tab-container
    setTimeout(() => this.init(), 100);
  }

  /**
   * initialize default TabPanels & TabPanel plugins
   */
  init() {
    this.allPanels = this.tabPanels.toArray().concat(this.pluginPanels.toArray());

    this.mainTabView.tabPanels = new QueryList<TabPanel>();
    this.mainTabView.tabPanels.reset(this.allPanels);

    this.mainTabView.initTabs();
    this.loadPanelOrder();
  }

  /**
   * opens specific TabPanel via native click event
   * @param panel
   */
  open(panel: TabPanel) {
    if (panel) {
      const target = this.mainTabView.el.nativeElement.querySelector(`a#${panel.id}-label`);
      if (target) {
        // use native event to trigger onChange
        target.click();
      }
    }
  }

  /**
   * returns TabPanel container ID
   * @param panel
   * @param postfix
   */
  pID(panel: TabPanel, postfix = '') {
    return panel && panel.viewContainer.element.nativeElement.id + postfix;
  }

  /**
   * Persist panel order state to cache
   */
  savePanelOrder() {
    this.isBigScreen.subscribe(() => {
      this.options.panelOrder = [this.pID(this.mainTabView.findSelectedTab()), ...this.splitPanels.map(p => this.pID(p))];
      if (this.options.panelOrder.length !== this.options.panelSizes.length) {
        this.options.panelSizes = [];
      }
      this.optionsChanged.emit(this.options);
    });
  }

  /**
   * Setup panel order based on cached value
   */
  loadPanelOrder() {
    this.isBigScreen.subscribe(() => {
      const panelOrder = this.options.panelOrder || [];
      if (panelOrder && panelOrder.length) {
        panelOrder.slice(1).forEach(id => this.splitPanelAdd(id));
        const tab = this.allPanels.find(p => this.pID(p) === panelOrder[0]);
        setTimeout(() => this.open(tab), 0);
      }
    });
  }

  dragEnd(evt: any) {
    this.options.panelSizes = evt.sizes;
    this.optionsChanged.emit(this.options);
  }
}
