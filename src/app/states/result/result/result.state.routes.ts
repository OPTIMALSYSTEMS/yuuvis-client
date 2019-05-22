import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResultComponent } from './result.component';
import { AuthGuard } from 'src/app/routing/auth-guard/auth-guard.service';

const routes: Routes = [
  { path: 'result', component: ResultComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultStateRoutingModule {
}