import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AppCacheService, done, IconRegistryService, SearchQuery, settings, TranslateService } from '@yuuvis/framework';
import { GridItemEvent, WidgetGridConfig, WidgetGridItemConfig, WidgetGridRegistry, WidgetGridUtils } from '@yuuvis/widget-grid';
import {
  ChartsSetupComponent,
  ChartsWidgetComponent,
  EVT_COUNT_TILE_CLICK,
  EVT_LIST_ITEM_CLICK,
  EVT_STORED_QUERY_EXECUTE,
  HitlistSetupComponent,
  HitlistWidgetComponent,
  StoredQuerySetupComponent,
  StoredQueryWidgetComponent
} from '@yuuvis/widget-grid-widgets';
import { AppSearchService } from '../../../service/app-search.service';
import { QuickSearchWidgetComponent } from '../../../widgets/quick-search-widget/quick-search-widget.component';
import { WIDGET_EVT_QUICKSEARCH_EXECUTE } from '../../../widgets/widgets.events';

@Component({
  selector: 'yuv-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  host: {
    class: 'themeBackground'
  }
})
export class DashboardWidgetsComponent implements OnInit {
  private STORAGE_KEY = 'yuv.client.cockpit.widgetgrid';
  gridItemConfig: Array<WidgetGridItemConfig> = [];
  gridEditMode: boolean = false;
  widgetPickerOpen: boolean = false;
  gridConfig: WidgetGridConfig = {
    rows: 10,
    columns: 10
  };

  constructor(
    private appCache: AppCacheService,
    private router: Router,
    private translate: TranslateService,
    private appSearch: AppSearchService,
    private iconRegistry: IconRegistryService,
    private widgetGridRegistry: WidgetGridRegistry
  ) {
    this.iconRegistry.registerIcons([settings, done]);
    this.translate.onLangChange.subscribe(() => this.updateWidgets());
  }

  onWidgetPickerOpen(open: boolean) {
    this.widgetPickerOpen = open;
  }

  onGridEvent(e: GridItemEvent) {
    // TODO: handle events comming from the grid widgets
    switch (e.action) {
      case EVT_COUNT_TILE_CLICK: {
        // emits SearchQuery object
        this.openSearchResult(e.data as SearchQuery);
        break;
      }
      case EVT_LIST_ITEM_CLICK: {
        // emits ID of the clicked list item
        this.router.navigate(['/object', e.data.id]);
        break;
      }
      case EVT_STORED_QUERY_EXECUTE: {
        this.openSearchResult(e.data as SearchQuery);
        break;
      }
      case WIDGET_EVT_QUICKSEARCH_EXECUTE: {
        this.openSearchResult(e.data as SearchQuery);
        break;
      }
    }
  }

  private openSearchResult(query: SearchQuery) {
    const navigationExtras: NavigationExtras = { queryParams: { query: JSON.stringify(query.toQueryJson()) } };
    this.appSearch.setQuery(query);
    this.router.navigate(['/result'], navigationExtras);
  }

  private updateWidgets() {
    this.widgetGridRegistry.clearRegisteredWidget();
    this.registerWidgets();
  }

  private registerWidgets() {
    this.widgetGridRegistry.registerGridWidgets([
      {
        name: 'yuv.widget.hitlist',
        label: this.translate.instant('yuv.client.dashboard.widgets.hitlist.label'),
        // label: 'Hitlist or count tile',
        setupComponent: HitlistSetupComponent,
        widgetComponent: HitlistWidgetComponent
      },
      {
        name: 'yuv.widget.storedquery',
        label: this.translate.instant('yuv.client.dashboard.widgets.storedquery.label'),
        // label: 'Stored query',
        setupComponent: StoredQuerySetupComponent,
        widgetComponent: StoredQueryWidgetComponent
      },
      {
        name: 'yuv.widget.charts',
        label: this.translate.instant('yuv.client.dashboard.widgets.charts.label'),
        // label: 'Charts',
        setupComponent: ChartsSetupComponent,
        widgetComponent: ChartsWidgetComponent
      },
      // own widgets
      {
        name: 'yuv.client.widget.quicksearch',
        label: this.translate.instant('yuv.client.dashboard.widgets.quicksearch.label'),
        widgetComponent: QuickSearchWidgetComponent
      }
    ]);
  }

  onGridChange(grid: Array<WidgetGridItemConfig>) {
    this.appCache.setItem(this.STORAGE_KEY, WidgetGridUtils.gridConfigStringify(grid)).subscribe();
  }

  ngOnInit(): void {
    this.registerWidgets();
    this.appCache.getItem(this.STORAGE_KEY).subscribe((res) => {
      this.gridItemConfig = res ? WidgetGridUtils.gridConfigParse(res as string) : [];
    });
  }
}
