import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvWidgetGridModule } from '@yuuvis/widget-grid';
import { YuvCommonModule } from '../common/common.module';
import { YuvFormModule } from '../form/form.module';
import { YuvSearchModule } from '../search/search.module';
import { DashboardWorkspacesComponent } from './dashboard-workspaces/dashboard-workspaces.component';
import { WorkspaceEditComponent } from './dashboard-workspaces/workspace-edit/workspace-edit.component';
import { QuickSearchWidgetComponent } from './widgets/quick-search-widget/quick-search-widget.component';

@NgModule({
  declarations: [DashboardWorkspacesComponent, QuickSearchWidgetComponent, WorkspaceEditComponent],
  exports: [DashboardWorkspacesComponent, QuickSearchWidgetComponent],
  imports: [CommonModule, TranslateModule, YuvFormModule, YuvCommonModule, YuvSearchModule, ReactiveFormsModule, YuvWidgetGridModule]
})
export class YuvDashboardModule {}
