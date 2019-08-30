import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';
import { TestSearchResultPanelComponent } from './test-search-result-panel/test-search-result-panel.component';
import { TestSearchResultComponent } from './test-search-result/test-search-result.component';
import { TestSummaryComponent } from './test-summary/test-summary.component';

const routes: Routes = [
  { path: 'yuv-object-form', component: TestObjectFormComponent },
  { path: 'yuv-search-result', component: TestSearchResultComponent },
  { path: 'test-search-result-panel', component: TestSearchResultPanelComponent },
  { path: 'yuv-summary', component: TestSummaryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
