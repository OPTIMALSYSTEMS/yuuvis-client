import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridConfig, WidgetGridItemConfig, WidgetGridUtils } from '@yuuvis/widget-grid';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, clear, done, edit, settings } from '../../svg.generated';
import { DashboardWorkspace, DashboardWorkspaceConfig } from '../dashboard.interface';

@Component({
  selector: 'yuv-dashboard-workspaces',
  templateUrl: './dashboard-workspaces.component.html',
  styleUrls: ['./dashboard-workspaces.component.scss']
})
export class DashboardWorkspacesComponent {
  @ViewChild('tplWorkspaceEdit') workspaceEditOverlay: TemplateRef<any>;
  private popoverRef: PopoverRef;

  gridItemConfig: Array<WidgetGridItemConfig>;
  gridEditMode: boolean = false;
  widgetPickerOpen: boolean = false;
  gridConfig: WidgetGridConfig = {
    rows: 10,
    columns: 10
  };

  private defaultDashboardConfig: DashboardWorkspaceConfig = {
    currentWorkspace: 'default',
    workspaces: [
      {
        id: 'default',
        label: 'DEFAULT',
        grid: WidgetGridUtils.gridConfigStringify([])
      }
    ]
  };
  private _dashboardConfig: DashboardWorkspaceConfig = this.defaultDashboardConfig;
  workspace: DashboardWorkspace = this.dashboardConfig.workspaces[0];
  // workspaceNameInput: FormControl = new FormControl('', Validators.required);

  @Input() set dashboardConfig(dc: DashboardWorkspaceConfig) {
    this._dashboardConfig = dc || this.defaultDashboardConfig;
    if (this._dashboardConfig) {
      this.setWorkspace(this._dashboardConfig.currentWorkspace);
    }
  }
  get dashboardConfig(): DashboardWorkspaceConfig {
    return this._dashboardConfig;
  }

  @Output() dashboardConfigChange = new EventEmitter<DashboardWorkspaceConfig>();
  @Output() gridItemEvent = new EventEmitter<GridItemEvent>();

  constructor(private popoverService: PopoverService, private translate: TranslateService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([settings, done, clear, addCircle, edit]);
  }

  onWidgetPickerOpen(open: boolean) {
    this.widgetPickerOpen = open;
  }

  onGridEvent(e: GridItemEvent) {
    this.gridItemEvent.emit(e);
  }

  onGridChange(grid: Array<WidgetGridItemConfig>) {
    if (this.workspace) {
      this.workspace.grid = WidgetGridUtils.gridConfigStringify(grid);
      const idx = this.dashboardConfig.workspaces.findIndex((w) => w.id === this.workspace.id);
      this.dashboardConfig.workspaces[idx] = this.workspace;
      this.emitConfigChange();
    }
  }

  setWorkspace(id: string) {
    const workspace = this.dashboardConfig.workspaces.find((w) => w.id === id);
    if (workspace) {
      this.workspace = workspace;
      this.gridItemConfig = WidgetGridUtils.gridConfigParse(workspace.grid);
      this.dashboardConfig.currentWorkspace = id;
      this.emitConfigChange();
    }
  }

  onWorkspaceSave(workspace: DashboardWorkspace) {
    const idx = this.dashboardConfig.workspaces.findIndex((w) => w.id === workspace.id);
    if (idx !== -1) {
      // existing workspace (update)
      this.dashboardConfig.workspaces[idx] = workspace;
    } else {
      // new workspace
      this.dashboardConfig.workspaces.push(workspace);
    }
    this.emitConfigChange();
    if (idx === -1) this.setWorkspace(workspace.id);
    this.popoverRef.close();
  }
  onWorkspaceEditCancel() {
    this.popoverRef.close();
  }

  removeWorkspace(id: string) {
    this.popoverService
      .confirm({
        message: this.translate.instant('yuv.client.dashboard.widgets.workspace.remove.message')
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.dashboardConfig.workspaces = this.dashboardConfig.workspaces.filter((w) => w.id !== id);
          if (this.dashboardConfig.workspaces.length) {
            this.setWorkspace(this.dashboardConfig.workspaces[0].id);
          } else {
            this.gridItemConfig = null;
          }
          this.emitConfigChange();
        }
      });
  }

  openWorkspaceEditOverlay(workspace?: DashboardWorkspace) {
    this.popoverRef = this.popoverService.open(this.workspaceEditOverlay, {
      data: { workspace }
    });
  }

  private emitConfigChange() {
    this.dashboardConfigChange.emit(this._dashboardConfig);
  }
}
