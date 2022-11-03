import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AppCacheService, ConfigService, SearchQuery, TranslateService, UserService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridRegistry, WidgetGridWorkspaceConfig, WidgetGridWorkspaceOptions } from '@yuuvis/widget-grid';
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
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
  private LOCAL_STORAGE_KEY_CURRENT_WORKSPACE = 'yuv.client.dashboard.workspaces.current';
  busy: boolean = true;
  dashboardConfig: DashboardConfig;
  workspaceConfig: WidgetGridWorkspaceConfig | undefined;
  workspaceOptions: WidgetGridWorkspaceOptions = {
    gridConfig: {
      rows: 25
    }
  };

  constructor(
    private appService: AppService,
    private appCacheService: AppCacheService,
    private appSearchService: AppSearchService,
    private widgetGridRegistry: WidgetGridRegistry,
    private userService: UserService,
    private translate: TranslateService,
    private router: Router,
    private config: ConfigService
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
        if (this.config.get('core.features.dashboardWorkspaces')) {
          this.dashboardConfig = res;
          if (res?.dashboardType === 'widgets') {
            this.registerWidgets();
            this.loadWorkspacesConfig();
          } else this.busy = false;
        } else {
          this.dashboardConfig = {
            dashboardType: 'default'
          };
          this.busy = false;
        }
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
    // the selected workspace is saved on the device while the workspaces themselves are stored on the user service
    forkJoin([
      this.userService.getSettings(this.STORAGE_KEY).pipe(catchError((e) => of({ workspaces: [] }))),
      this.appCacheService.getItem(this.LOCAL_STORAGE_KEY_CURRENT_WORKSPACE).pipe(catchError((e) => of(null)))
    ])
      .pipe(
        map((res) => {
          const workspaces = res[0] ? res[0].workspaces : [];
          const currentWorkspace = res[1];
          // check if current workspace still exists in workspaces array
          let cws: string;
          if (currentWorkspace && workspaces.map((w) => w.id).includes(currentWorkspace)) {
            cws = currentWorkspace;
          } else if (!!workspaces.length) {
            cws = workspaces[0].id;
          }
          return {
            currentWorkspace: cws,
            workspaces
          };
        })
      )
      .subscribe({
        next: (res) => {
          this.workspaceConfig = res;
          this.busy = false;
        }
      });
  }

  private saveWorkspacesConfig(c: WidgetGridWorkspaceConfig) {
    // the selected workspace is saved on the device while the workspaces themselves are stored on the user service
    this.userService
      .saveSettings(this.STORAGE_KEY, { workspaces: c.workspaces })
      .pipe(switchMap(() => this.appCacheService.setItem(this.LOCAL_STORAGE_KEY_CURRENT_WORKSPACE, c.currentWorkspace)))
      .subscribe();
  }

  ngOnDestroy(): void {}
}
