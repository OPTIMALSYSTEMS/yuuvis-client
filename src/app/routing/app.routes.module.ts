import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { AboutComponent } from '../states/about/component/about.component';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { LoginComponent } from '../states/login/login.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { AuthGuard } from './auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { path: 'enter', component: LoginComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  {
    path: 'navigation',
    component: NavigationComponent,
    canActivate: [AuthGuard],
    outlet: 'modal'
  },
  // default route
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // 404 route
  { path: 'not-found', component: NotFoundComponent },
  // redirecting route
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
