import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { SearchQuery, TranslateService, UserService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridRegistry, WidgetGridWorkspaceConfig } from '@yuuvis/widget-grid';
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
import { takeUntilDestroy } from 'take-until-destroy';

import { DashboardConfig } from '../../app.interface';
import { AppService } from '../../app.service';
import { AppSearchService } from '../../service/app-search.service';
import { QuickSearchWidgetComponent } from './widgets/quick-search-widget/quick-search-widget.component';
import { WIDGET_EVT_QUICKSEARCH_EXECUTE } from './widgets/widgets.events';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground ' }
})
export class DashboardComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.client.dashboard.workspaces';
  busy: boolean = true;
  dashboardConfig: DashboardConfig;
  workspaceConfig: WidgetGridWorkspaceConfig | undefined;

  constructor(
    private appService: AppService,
    private appSearchService: AppSearchService,
    private widgetGridRegistry: WidgetGridRegistry,
    private userService: UserService,
    private translate: TranslateService,
    private router: Router
  ) {}

  onWorkspacesConfigChange(c: WidgetGridWorkspaceConfig) {
    this.saveWorkspacesConfig(c);
  }

  onGridEvent(e: GridItemEvent) {
    switch (e.action) {
      case EVT_LIST_ITEM_CLICK: {
        this.router.navigate(['object', e.data.id]);
        break;
      }
      case EVT_COUNT_TILE_CLICK: {
        this.openSearchResult(e.data, true);
        break;
      }
      case EVT_STORED_QUERY_EXECUTE: {
        this.openSearchResult(e.data, true);
        break;
      }
      case WIDGET_EVT_QUICKSEARCH_EXECUTE: {
        this.openSearchResult(e.data);
        break;
      }
    }
  }

  private async openSearchResult(query: SearchQuery, preventAppSearchSet: boolean = false) {
    const navigationExtras: NavigationExtras = { queryParams: { query: JSON.stringify(query.toQueryJson()) } };
    await this.router.navigate(['/result'], navigationExtras);
    if (!preventAppSearchSet) {
      this.appSearchService.setQuery(query);
    }
  }

  ngOnInit(): void {
    this.appService.dashboardConfig$.pipe(takeUntilDestroy(this)).subscribe({
      next: (res) => {
        this.dashboardConfig = res;
        if (res?.dashboardType === 'widgets') {
          this.registerWidgets();
          this.loadWorkspacesConfig();
        } else this.busy = false;
      }
    });
  }

  // widget grid workspace
  private registerWidgets() {
    this.widgetGridRegistry.registerGridWidgets([
      {
        name: 'yuv.widget.hitlist',
        label: this.translate.instant('yuv.client.dashboard.widgets.hitlist.label'),
        setupComponent: HitlistSetupComponent,
        widgetComponent: HitlistWidgetComponent
      },
      {
        name: 'yuv.widget.storedquery',
        label: this.translate.instant('yuv.client.dashboard.widgets.storedquery.label'),
        setupComponent: StoredQuerySetupComponent,
        widgetComponent: StoredQueryWidgetComponent
      },
      {
        name: 'yuv.widget.charts',
        label: this.translate.instant('yuv.client.dashboard.widgets.charts.label'),
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

  private loadWorkspacesConfig() {
    this.busy = true;
    this.userService.getSettings(this.STORAGE_KEY).subscribe({
      next: (res) => {
        this.workspaceConfig = res;
        this.busy = false;
      }
    });
  }

  private saveWorkspacesConfig(c: WidgetGridWorkspaceConfig) {
    this.userService.saveSettings(this.STORAGE_KEY, c).subscribe();
  }

  ngOnDestroy(): void {}
}
