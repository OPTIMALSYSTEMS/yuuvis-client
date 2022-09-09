import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from '@yuuvis/core';
import { PluginComponent, PluginGuard } from '@yuuvis/framework';
import { AboutComponent } from '../states/about/component/about.component';
import { CockpitComponent } from '../states/cockpit/cockpit.component';
import { ColumnConfigurationComponent } from '../states/column-configuration/column-configuration.component';
import { CreateComponent } from '../states/create/create.component';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';
import { ObjectComponent } from '../states/object/object.component';
import { ProcessesComponent } from '../states/processes/processes.component';
import { ResultComponent } from '../states/result/result.component';
import { RetentionsComponent } from '../states/retentions/retentions.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { FilterConfigurationComponent } from './../states/filter-configuration/filter-configuration.component';
import { FollowUpsComponent } from './../states/follow-ups/follow-ups.component';
import { InboxComponent } from './../states/inbox/inbox.component';
import { VersionsComponent } from './../states/versions/versions.component';
import { OfflineGuard } from './offline-guard/offline-guard.service';

const routes: Routes = [
  { path: 'custom/:type', component: PluginComponent, canActivate: [PluginGuard], canDeactivate: [PluginGuard, OfflineGuard] },
  { path: 'cockpit', component: CockpitComponent, canDeactivate: [OfflineGuard], data: { transparentAppBar: true } },
  { path: 'dashboard', component: DashboardComponent, canDeactivate: [OfflineGuard], data: { transparentAppBar: true } },
  { path: 'settings', component: SettingsComponent, canDeactivate: [OfflineGuard] },
  { path: 'config/column-config', component: ColumnConfigurationComponent, canDeactivate: [OfflineGuard] },
  { path: 'config/filter-config', component: FilterConfigurationComponent, canDeactivate: [OfflineGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'create', component: CreateComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'result', component: ResultComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'retentions', component: RetentionsComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'inbox', component: InboxComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'follow-ups', component: FollowUpsComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'processes', component: ProcessesComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'object/:id', component: ObjectComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'versions/:id', component: VersionsComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  // default route
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // 404 route
  { path: 'not-found', component: NotFoundComponent },
  // redirecting route
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, { initialNavigation: 'enabledNonBlocking', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
