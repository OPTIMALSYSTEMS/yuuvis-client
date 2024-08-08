import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestActionMenuComponent } from './test-action-menu/test-action-menu.component';
import { TestAnimatedIconsComponent } from './test-animated-icons/test-animated-icons.component';
import { TestAuditComponent } from './test-audit/test-audit.component';
import { TestColumnConfigComponent } from './test-column-config/test-column-config.component';
import { TestContentPreviewComponent } from './test-content-preview/test-content-preview.component';
import { TestContextComponent } from './test-context/test-context.component';
import { TestDirectivesComponent } from './test-directives/test-directives.component';
import { TestFileDropComponent } from './test-file-drop/test-file-drop.component';
import { TestFormElementsComponent } from './test-form-elements/test-form-elements.component';
import { TestFormInputComponent } from './test-form-input/test-form-input.component';
import { TestGroupedSelectComponent } from './test-grouped-select/test-grouped-select.component';
import { TestIconsComponent } from './test-icons/test-icons/test-icons.component';
import { TestLoadingSpinnerComponent } from './test-loading-spinner/test-loading-spinner.component';
import { TestObjectCreateComponent } from './test-object-create/test-object-create.component';
import { TestObjectDetailsCompareComponent } from './test-object-details-compare/test-object-details-compare.component';
import { TestObjectDetailsComponent } from './test-object-details/test-object-details.component';
import { TestObjectFormEditComponent } from './test-object-form-edit/test-object-form-edit.component';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';
import { TestObjectPickerComponent } from './test-object-picker/test-object-picker.component';
import { TestPanelComponent } from './test-panel/test-panel.component';
import { TestPopoverComponent } from './test-popover/test-popover.component';
import { TestProcessDetailsComponent } from './test-process-details/test-process-details.component';
import { TestQuickSearchComponent } from './test-quick-search/test-quick-search.component';
import { TestQuickfinderComponent } from './test-quickfinder/test-quickfinder.component';
import { TestRecentActivitiesComponent } from './test-recent-activities/test-recent-activities.component';
import { TestResponsiveTabContainerComponent } from './test-responsive-tab-container/test-responsive-tab-container.component';
import { TestSearchResultPanelComponent } from './test-search-result-panel/test-search-result-panel.component';
import { TestSearchResultComponent } from './test-search-result/test-search-result.component';
import { TestSequenceListComponent } from './test-sequence-list/test-sequence-list.component';
import { TestSummaryComponent } from './test-summary/test-summary.component';
import { TestTaskDetailsComponent } from './test-task-details/test-task-details.component';
import { TestUploadProgressOverlayComponent } from './test-upload-progress-overlay/test-upload-progress-overlay.component';
import { TestUserAvatarComponent } from './test-user-avatar/test-user-avatar.component';
import { TestVersionListComponent } from './test-version-list/test-version-list.component';

const routes: Routes = [
  { path: 'action-menu', component: TestActionMenuComponent },
  { path: 'animated-icons', component: TestAnimatedIconsComponent },
  { path: 'audit', component: TestAuditComponent },
  { path: 'column-config', component: TestColumnConfigComponent },
  { path: 'content-preview', component: TestContentPreviewComponent },
  { path: 'context', component: TestContextComponent },
  { path: 'directives', component: TestDirectivesComponent },
  { path: 'file-drop', component: TestFileDropComponent },
  { path: 'form-input', component: TestFormInputComponent },
  { path: 'form-elements', component: TestFormElementsComponent },
  { path: 'grouped-select', component: TestGroupedSelectComponent },
  { path: 'loading spinner', component: TestLoadingSpinnerComponent },
  { path: 'responsive-tab-container', component: TestResponsiveTabContainerComponent },
  { path: 'object-create', component: TestObjectCreateComponent },
  { path: 'object-details', component: TestObjectDetailsComponent },
  { path: 'object-details-compare', component: TestObjectDetailsCompareComponent },
  { path: 'object-form', component: TestObjectFormComponent },
  { path: 'object-form-edit', component: TestObjectFormEditComponent },
  { path: 'object-picker', component: TestObjectPickerComponent },
  { path: 'panel', component: TestPanelComponent },
  { path: 'popover', component: TestPopoverComponent },
  { path: 'process-details', component: TestProcessDetailsComponent },
  { path: 'quickfinder', component: TestQuickfinderComponent },
  { path: 'quick-search', component: TestQuickSearchComponent },
  { path: 'search-result', component: TestSearchResultComponent },
  { path: 'search-result-panel', component: TestSearchResultPanelComponent },
  { path: 'recent-activities', component: TestRecentActivitiesComponent },
  { path: 'sequence-list', component: TestSequenceListComponent },
  { path: 'summary', component: TestSummaryComponent },
  { path: 'task-details', component: TestTaskDetailsComponent },
  { path: 'user-avatar', component: TestUserAvatarComponent },
  { path: 'upload-progress-overlay', component: TestUploadProgressOverlayComponent },
  { path: 'version-list', component: TestVersionListComponent },
  { path: 'icons', component: TestIconsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
