import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';

const routes: Routes = [{ path: 'yuv-object-form', component: TestObjectFormComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
