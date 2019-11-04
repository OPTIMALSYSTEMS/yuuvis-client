import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestActionMenuComponent } from './test-action-menu/test-action-menu.component';
import { TestAuditComponent } from './test-audit/test-audit.component';
import { TestContentPreviewComponent } from './test-content-preview/test-content-preview.component';
import { TestObjectDetailsComponent } from './test-object-details/test-object-details.component';
import { TestObjectFormEditComponent } from './test-object-form-edit/test-object-form-edit.component';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';
import { TestPanelComponent } from './test-panel/test-panel.component';
import { TestQuickSearchComponent } from './test-quick-search/test-quick-search.component';
import { TestResponsiveTabContainerComponent } from './test-responsive-tab-container/test-responsive-tab-container.component';
import { TestSearchResultPanelComponent } from './test-search-result-panel/test-search-result-panel.component';
import { TestSearchResultComponent } from './test-search-result/test-search-result.component';
import { TestSummaryComponent } from './test-summary/test-summary.component';
import { TestUploadProgressOverlayComponent } from './test-upload-progress-overlay/test-upload-progress-overlay.component';

const routes: Routes = [
  { path: 'object-form', component: TestObjectFormComponent },
  { path: 'object-form-edit', component: TestObjectFormEditComponent },
  { path: 'search-result', component: TestSearchResultComponent },
  { path: 'search-result-panel', component: TestSearchResultPanelComponent },
  { path: 'responsive-tab-container', component: TestResponsiveTabContainerComponent },
  { path: 'object-details', component: TestObjectDetailsComponent },
  { path: 'audit', component: TestAuditComponent },
  { path: 'content-preview', component: TestContentPreviewComponent },
  { path: 'panel', component: TestPanelComponent },
  { path: 'quick-search', component: TestQuickSearchComponent },
  { path: 'action-menu', component: TestActionMenuComponent },
  { path: 'summary', component: TestSummaryComponent },
  { path: 'upload-progress-overlay', component: TestUploadProgressOverlayComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
