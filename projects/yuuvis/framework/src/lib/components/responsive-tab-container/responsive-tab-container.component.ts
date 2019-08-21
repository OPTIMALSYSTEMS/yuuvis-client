import { AfterContentInit, AfterViewInit, Component, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TabPanel, TabView } from 'primeng/tabview';

@Component({
  selector: 'yuv-responsive-tab-container',
  templateUrl: './responsive-tab-container.component.html',
  styleUrls: ['./responsive-tab-container.component.scss']
})
export class ResponsiveTabContainerComponent implements OnInit, AfterContentInit, AfterViewInit {
  @Input() pluginPanels = new QueryList<TabPanel>();

  @ContentChildren(TabPanel) tabPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewTabPanels: QueryList<TabPanel>;

  @ViewChild('mainTabView', { static: true }) mainTabView: TabView;
  @ViewChildren('splitTabView') splitTabViews: QueryList<TabView>;

  allPanels: TabPanel[] = [];
  splitPanels: TabPanel[] = [];

  splitPanelAdd() {
    const panel = this.mainTabView.findSelectedTab();
    if (panel && this.allPanels.length > this.splitPanels.length + 1) {
      panel.selected = false;
      panel.disabled = true;
      this.splitPanels.push(panel);
      setTimeout(() => this.movePanelContent(panel, this.splitTabViews.last), 100);
      const select = this.mainTabView.tabPanels.find(p => !p.selected && !p.disabled);
      if (select) {
        select.selected = true;
      }
    }
  }

  splitPanelClose(evt, panel: TabPanel, index: any) {
    this.movePanelContent(panel);
    evt.close();
    panel.disabled = false;
    this.splitPanels.splice(index, 1);
  }

  movePanelContent(panel: TabPanel, tabView: TabView = this.mainTabView) {
    tabView.el.nativeElement.firstElementChild.lastElementChild.appendChild(panel.viewContainer.element.nativeElement);
  }

  constructor() {}

  ngOnInit() {}

  ngAfterContentInit() {
    // timeout to run init after ngAfterContentInit of tab-container
    setTimeout(() => this.init(), 100);
  }

  ngAfterViewInit() {
    // this.splitTabViews.changes.subscribe((queryList: QueryList<TabView>) => {});
  }

  init(panelOrder?: any) {
    this.allPanels = this.tabPanels.toArray().concat(this.pluginPanels.toArray());

    this.mainTabView.tabPanels = new QueryList<TabPanel>();
    this.mainTabView.tabPanels.reset(this.allPanels);

    this.mainTabView.initTabs();
  }

  onChange(e: any) {
    e.originalEvent.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}
