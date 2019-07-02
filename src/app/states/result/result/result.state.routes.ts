import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/routing/auth-guard/auth-guard.service';
import { ResultDetailsComponent } from '../result-details/result-details.component';
import { ResultComponent } from './result.component';

const routes: Routes = [
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [AuthGuard],
    children: [{ path: ':id', component: ResultDetailsComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultStateRoutingModule {}
