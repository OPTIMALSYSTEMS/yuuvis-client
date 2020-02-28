import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from '@yuuvis/core';
import { AboutComponent } from '../states/about/component/about.component';
import { ColumnConfigurationComponent } from '../states/column-configuration/column-configuration.component';
import { CreateComponent } from '../states/create/create.component';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';
import { ObjectComponent } from '../states/object/object.component';
import { ResultComponent } from '../states/result/result.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { OfflineGuard } from './offline-guard/offline-guard.service';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canDeactivate: [OfflineGuard] },
  { path: 'settings', component: SettingsComponent, canDeactivate: [OfflineGuard] },
  { path: 'config/column-config', component: ColumnConfigurationComponent, canDeactivate: [OfflineGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'create', component: CreateComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'result', component: ResultComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  { path: 'object/:id', component: ObjectComponent, canDeactivate: [OfflineGuard, PendingChangesGuard] },
  // default route
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // 404 route
  { path: 'not-found', component: NotFoundComponent },
  // redirecting route
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, { initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
