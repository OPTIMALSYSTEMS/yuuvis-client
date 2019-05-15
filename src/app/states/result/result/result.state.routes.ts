import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { ResultComponent } from './result.component';

const routes: Routes = [
  {
    path: 'result', component: ResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultStateRoutingModule {
}