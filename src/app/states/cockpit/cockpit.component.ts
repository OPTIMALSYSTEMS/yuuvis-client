import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AppCacheService, SearchQuery } from '@yuuvis/core';
import { IconRegistryService, settings } from '@yuuvis/framework';
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
import { AppSearchService } from '../../service/app-search.service';
import { QuickSearchWidgetComponent } from '../../widgets/quick-search-widget/quick-search-widget.component';

@Component({
  selector: 'yuv-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss'],
  host: {
    class: 'themeBackground'
  }
})
export class CockpitComponent implements OnInit {
  private STORAGE_KEY = 'yuv.client.cockpit.widgetgrid';
  gridItemConfig: Array<WidgetGridItemConfig> = [];
  gridEditMode: boolean = false;
  gridConfig: WidgetGridConfig = {
    rows: 10,
    columns: 10
  };

  constructor(
    private appCache: AppCacheService,
    private router: Router,
    private appSearch: AppSearchService,
    private iconRegistry: IconRegistryService,
    private widgetGridRegistry: WidgetGridRegistry
  ) {
    this.iconRegistry.registerIcons([settings]);
  }

  onGridEvent(e: GridItemEvent) {
    console.log(e);

    // TODO: handle events comming from the grid widgets
    switch (e.action) {
      case EVT_COUNT_TILE_CLICK: {
        // emits SearchQuery object
        this.openSearchResult(e.data as SearchQuery);
        break;
      }
      case EVT_LIST_ITEM_CLICK: {
        // emits ID of the clicked list item
        this.router.navigate(['/object', e.data]);
        break;
      }
      case EVT_STORED_QUERY_EXECUTE: {
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

  private registerWidgets() {
    this.widgetGridRegistry.registerGridWidgets([
      {
        name: 'yuv.widget.hitlist',
        label: 'Hitlist or count tile',
        setupComponent: HitlistSetupComponent,
        widgetComponent: HitlistWidgetComponent
      },
      {
        name: 'yuv.widget.storedquery',
        label: 'Stored query',
        setupComponent: StoredQuerySetupComponent,
        widgetComponent: StoredQueryWidgetComponent
      },
      {
        name: 'yuv.widget.charts',
        label: 'Charts',
        setupComponent: ChartsSetupComponent,
        widgetComponent: ChartsWidgetComponent
      },
      // own widgets
      {
        name: 'yuv.client.widget.quicksearch',
        label: 'Search',
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
