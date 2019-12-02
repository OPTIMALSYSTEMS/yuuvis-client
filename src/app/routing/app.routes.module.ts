import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from '@yuuvis/core';
import { AboutComponent } from '../states/about/component/about.component';
import { CreateComponent } from '../states/create/create.component';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';
import { ObjectComponent } from '../states/object/object.component';
import { ResultComponent } from '../states/result/result.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { OfflineGuard } from './offline-guard/offline-guard.service';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [OfflineGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [OfflineGuard] },
  { path: 'about', component: AboutComponent, canActivate: [OfflineGuard] },
  { path: 'create', component: CreateComponent, canActivate: [OfflineGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'result', component: ResultComponent, canActivate: [OfflineGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'object/:id', component: ObjectComponent, canActivate: [OfflineGuard], canDeactivate: [PendingChangesGuard] },
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
