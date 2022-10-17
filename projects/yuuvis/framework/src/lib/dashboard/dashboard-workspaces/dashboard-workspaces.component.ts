import { Component, OnInit } from '@angular/core';
import { TranslateService, UserService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridRegistry, WidgetGridWorkspaceConfig } from '@yuuvis/widget-grid';
import { HitlistSetupComponent, HitlistWidgetComponent, StoredQuerySetupComponent, StoredQueryWidgetComponent } from '@yuuvis/widget-grid-widgets';
import { QuickSearchWidgetComponent } from '../widgets/quick-search-widget/quick-search-widget.component';

@Component({
  selector: 'yuv-dashboard-workspaces',
  templateUrl: './dashboard-workspaces.component.html',
  styleUrls: ['./dashboard-workspaces.component.scss']
})
export class DashboardWorkspacesComponent implements OnInit {
  private STORAGE_KEY = 'yuv.framework.dashboard.workspaces';

  // dirty: boolean = false;
  workspaceConfig: WidgetGridWorkspaceConfig | undefined;
  // private _updatedWidgetGridWorkspaceConfig: WidgetGridWorkspaceConfig | undefined;

  constructor(private widgetGridRegistry: WidgetGridRegistry, private userService: UserService, 
    private translate: TranslateService) {}

  onWorkspacesConfigChange(c: WidgetGridWorkspaceConfig) {
    // this.dirty = true;
    // this._updatedWidgetGridWorkspaceConfig = c;
    console.log(c);
    // this.saveWorkspacesConfig(c);
  }

  onGridEvent(e: GridItemEvent) {
    console.log(e);
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
      // {
      //   name: 'yuv.widget.charts',
      //   label: this.translate.instant('yuv.client.dashboard.widgets.charts.label'),
      //   // label: 'Charts',
      //   setupComponent: ChartsSetupComponent,
      //   widgetComponent: ChartsWidgetComponent
      // },
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

  ngOnInit(): void {
    this.registerWidgets();
    this.loadWorkspacesConfig();
  }

  // @ViewChild('tplWorkspaceEdit') workspaceEditOverlay: TemplateRef<any>;
  // private popoverRef: PopoverRef;

  // gridItemConfig: Array<WidgetGridItemConfig>;
  // gridEditMode: boolean = false;
  // widgetPickerOpen: boolean = false;
  // gridConfig: WidgetGridConfig = {
  //   rows: 10,
  //   columns: 10
  // };

  // private defaultDashboardConfig: DashboardWorkspaceConfig = {
  //   currentWorkspace: 'default',
  //   workspaces: [
  //     {
  //       id: 'default',
  //       label: 'DEFAULT',
  //       grid: WidgetGridUtils.gridConfigStringify([])
  //     }
  //   ]
  // };
  // private _dashboardConfig: DashboardWorkspaceConfig = this.defaultDashboardConfig;
  // workspace: DashboardWorkspace = this.dashboardConfig.workspaces[0];
  // // workspaceNameInput: FormControl = new FormControl('', Validators.required);

  // @Input() set dashboardConfig(dc: DashboardWorkspaceConfig) {
  //   this._dashboardConfig = dc || this.defaultDashboardConfig;
  //   if (this._dashboardConfig) {
  //     this.setWorkspace(this._dashboardConfig.currentWorkspace);
  //   }
  // }
  // get dashboardConfig(): DashboardWorkspaceConfig {
  //   return this._dashboardConfig;
  // }

  // @Output() dashboardConfigChange = new EventEmitter<DashboardWorkspaceConfig>();
  // @Output() gridItemEvent = new EventEmitter<GridItemEvent>();

  // constructor(private popoverService: PopoverService, private translate: TranslateService, private iconRegistry: IconRegistryService) {
  //   this.iconRegistry.registerIcons([settings, done, clear, addCircle, edit]);
  // }

  // onWidgetPickerOpen(open: boolean) {
  //   this.widgetPickerOpen = open;
  // }

  // onGridEvent(e: GridItemEvent) {
  //   this.gridItemEvent.emit(e);
  // }

  // onGridChange(grid: Array<WidgetGridItemConfig>) {
  //   if (this.workspace) {
  //     this.workspace.grid = WidgetGridUtils.gridConfigStringify(grid);
  //     const idx = this.dashboardConfig.workspaces.findIndex((w) => w.id === this.workspace.id);
  //     this.dashboardConfig.workspaces[idx] = this.workspace;
  //     this.emitConfigChange();
  //   }
  // }

  // setWorkspace(id: string) {
  //   const workspace = this.dashboardConfig.workspaces.find((w) => w.id === id);
  //   if (workspace) {
  //     this.workspace = workspace;
  //     this.gridItemConfig = WidgetGridUtils.gridConfigParse(workspace.grid);
  //     this.dashboardConfig.currentWorkspace = id;
  //     this.emitConfigChange();
  //   }
  // }

  // onWorkspaceSave(workspace: DashboardWorkspace) {
  //   const idx = this.dashboardConfig.workspaces.findIndex((w) => w.id === workspace.id);
  //   if (idx !== -1) {
  //     // existing workspace (update)
  //     this.dashboardConfig.workspaces[idx] = workspace;
  //   } else {
  //     // new workspace
  //     this.dashboardConfig.workspaces.push(workspace);
  //   }
  //   this.emitConfigChange();
  //   if (idx === -1) this.setWorkspace(workspace.id);
  //   this.popoverRef.close();
  // }
  // onWorkspaceEditCancel() {
  //   this.popoverRef.close();
  // }

  // removeWorkspace(id: string) {
  //   this.popoverService
  //     .confirm({
  //       message: this.translate.instant('yuv.client.dashboard.widgets.workspace.remove.message')
  //     })
  //     .subscribe((confirmed: boolean) => {
  //       if (confirmed) {
  //         this.dashboardConfig.workspaces = this.dashboardConfig.workspaces.filter((w) => w.id !== id);
  //         if (this.dashboardConfig.workspaces.length) {
  //           this.setWorkspace(this.dashboardConfig.workspaces[0].id);
  //         } else {
  //           this.gridItemConfig = null;
  //         }
  //         this.emitConfigChange();
  //       }
  //     });
  // }

  // openWorkspaceEditOverlay(workspace?: DashboardWorkspace) {
  //   this.popoverRef = this.popoverService.open(this.workspaceEditOverlay, {
  //     data: { workspace }
  //   });
  // }

  // private emitConfigChange() {
  //   this.dashboardConfigChange.emit(this._dashboardConfig);
  // }
}
