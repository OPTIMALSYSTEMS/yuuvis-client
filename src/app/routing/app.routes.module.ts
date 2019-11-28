import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from '@yuuvis/core';
import { AboutComponent } from '../states/about/component/about.component';
import { CreateComponent } from '../states/create/create.component';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { EnterComponent } from '../states/enter/enter.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';
import { ObjectComponent } from '../states/object/object.component';
import { OfflineComponent } from '../states/offline/offline.component';
import { ResultComponent } from '../states/result/result.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { AuthGuard } from './auth-guard/auth-guard.service';
import { OfflineGuard } from './offline-guard/offline-guard.service';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, OfflineGuard]
  },
  { path: 'enter', component: EnterComponent, canActivate: [OfflineGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard, OfflineGuard] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard, OfflineGuard] },
  { path: 'create', component: CreateComponent, canActivate: [AuthGuard, OfflineGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'result', component: ResultComponent, canActivate: [AuthGuard, OfflineGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'offline', component: OfflineComponent, canActivate: [AuthGuard, OfflineGuard] },
  { path: 'object/:id', component: ObjectComponent, canActivate: [AuthGuard, OfflineGuard], canDeactivate: [PendingChangesGuard] },
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
