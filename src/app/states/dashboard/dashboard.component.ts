import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, UserService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridRegistry, WidgetGridWorkspaceConfig } from '@yuuvis/widget-grid';
import { takeUntilDestroy } from 'take-until-destroy';

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
import { DashboardConfig } from '../../app.interface';
import { AppService } from '../../app.service';
import { QuickSearchWidgetComponent } from './widgets/quick-search-widget/quick-search-widget.component';

@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground ' }
})
export class DashboardComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.client.dashboard.workspaces';

  dashboardConfig: DashboardConfig;
  workspaceConfig: WidgetGridWorkspaceConfig | undefined;

  constructor(
    private appService: AppService,
    private widgetGridRegistry: WidgetGridRegistry,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  onWorkspacesConfigChange(c: WidgetGridWorkspaceConfig) {
    console.log('DASHBOARD CONFIG CHANGE', c);
    // this.saveWorkspacesConfig(c);
  }

  onGridEvent(e: GridItemEvent) {
    switch (e.action) {
      case EVT_LIST_ITEM_CLICK: {
        console.log('LIC', e.data);
        break;
      }
      case EVT_COUNT_TILE_CLICK: {
        console.log('CTC', e.data);
        break;
      }
      case EVT_STORED_QUERY_EXECUTE: {
        console.log('SQ', e.data);
        break;
      }
    }
  }

  ngOnInit(): void {
    this.appService.dashboardConfig$.pipe(takeUntilDestroy(this)).subscribe({
      next: (res) => {
        this.dashboardConfig = res;
        if (res?.dashboardType === 'widgets') {
          this.registerWidgets();
          this.loadWorkspacesConfig();
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
    this.userService.getSettings(this.STORAGE_KEY).subscribe({
      next: (res) => {
        this.workspaceConfig = res;
      }
    });
  }

  private saveWorkspacesConfig(c: WidgetGridWorkspaceConfig) {
    this.userService.saveSettings(this.STORAGE_KEY, c).subscribe();
  }

  ngOnDestroy(): void {}
}
