import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResultComponent } from './result.component';
import { ResultDetailsComponent } from './result-details/result-details.component';

const routes: Routes = [
  {
    path: 'result', component: ResultComponent, children: [
      // { path: '', redirectTo: 'details/empty', pathMatch: 'full' },
      { path: 'details/:id', component: ResultDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultStateRoutingModule {
}