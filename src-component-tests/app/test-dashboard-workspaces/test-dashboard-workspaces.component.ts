import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { AppCacheService, DashboardWorkspaceConfig, QuickSearchWidgetComponent } from '@yuuvis/framework';
import { WidgetGridRegistry } from '@yuuvis/widget-grid';
import {
  ChartsSetupComponent,
  ChartsWidgetComponent,
  HitlistSetupComponent,
  HitlistWidgetComponent,
  StoredQuerySetupComponent,
  StoredQueryWidgetComponent
} from '@yuuvis/widget-grid-widgets';

@Component({
  selector: 'app-test-dashboard-workspaces',
  templateUrl: './test-dashboard-workspaces.component.html',
  styleUrls: ['./test-dashboard-workspaces.component.scss']
})
export class TestDashboardWorkspacesComponent implements OnInit {
  private STORAGE_KEY = 'yuv.client.test.dashboard-workspaces';
  dashboardConfig: DashboardWorkspaceConfig;

  constructor(private widgetGridRegistry: WidgetGridRegistry, private appCache: AppCacheService, private translate: TranslateService) {}

  onGridItemEvent(e) {}

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

  onDashboardConfigChange(dcfg: DashboardWorkspaceConfig) {
    this.appCache.setItem(this.STORAGE_KEY, dcfg).subscribe();
  }

  ngOnInit(): void {
    this.registerWidgets();
    this.appCache.getItem(this.STORAGE_KEY).subscribe({
      next: (res) => {
        this.dashboardConfig = res;
      }
    });
  }
}
