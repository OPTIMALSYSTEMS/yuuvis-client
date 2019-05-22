import { Routes, RouterModule } from "@angular/router";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../states/dashboard/dashboard.component';
import { AuthGuard } from './auth-guard/auth-guard.service';
import { LoginComponent } from '../states/login/login.component';
import { SettingsComponent } from '../states/settings/settings.component';
import { NotFoundComponent } from '../states/not-found/not-found.component';

const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'enter', component: LoginComponent },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },

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
export class AppRoutingModule { }