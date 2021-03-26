import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  YuvColumnConfigModule,
  YuvComponentsModule,
  YuvContextModule,
  YuvDirectivesModule,
  YuvFrameworkModule,
  YuvGroupedSelectModule,
  YuvQuickfinderModule
} from '@yuuvis/framework';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DmsObjectPickerComponent } from './components/dms-object-picker/dms-object-picker.component';
import { TestActionMenuComponent } from './test-action-menu/test-action-menu.component';
import { TestAnimatedIconsComponent } from './test-animated-icons/test-animated-icons.component';
import { TestAuditComponent } from './test-audit/test-audit.component';
import { TestColumnConfigComponent } from './test-column-config/test-column-config.component';
import { TestContentPreviewComponent } from './test-content-preview/test-content-preview.component';
import { TestContextComponent } from './test-context/test-context.component';
import { TestFileDropComponent } from './test-file-drop/test-file-drop.component';
import { TestGroupedSelectComponent } from './test-grouped-select/test-grouped-select.component';
import { TestIconsComponent } from './test-icons/test-icons/test-icons.component';
import { TestLoadingSpinnerComponent } from './test-loading-spinner/test-loading-spinner.component';
import { TestObjectCreateComponent } from './test-object-create/test-object-create.component';
import { TestObjectDetailsCompareComponent } from './test-object-details-compare/test-object-details-compare.component';
import { TestObjectDetailsComponent } from './test-object-details/test-object-details.component';
import { TestObjectFormEditComponent } from './test-object-form-edit/test-object-form-edit.component';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';
import { TestPanelComponent } from './test-panel/test-panel.component';
import { TestQuickSearchComponent } from './test-quick-search/test-quick-search.component';
import { TestQuickfinderComponent } from './test-quickfinder/test-quickfinder.component';
import { TestRecentActivitiesComponent } from './test-recent-activities/test-recent-activities.component';
import { TestResponsiveTabContainerComponent } from './test-responsive-tab-container/test-responsive-tab-container.component';
import { TestSearchResultPanelComponent } from './test-search-result-panel/test-search-result-panel.component';
import { TestSearchResultComponent } from './test-search-result/test-search-result.component';
import { TestSummaryComponent } from './test-summary/test-summary.component';
import { TestUploadProgressOverlayComponent } from './test-upload-progress-overlay/test-upload-progress-overlay.component';
import { TestUserAvatarComponent } from './test-user-avatar/test-user-avatar.component';
import { TestVersionListComponent } from './test-version-list/test-version-list.component';
import { TestPopoverComponent } from './test-popover/test-popover.component';

@NgModule({
  declarations: [
    AppComponent,
    TestObjectFormComponent,
    TestSummaryComponent,
    TestSearchResultComponent,
    TestSearchResultPanelComponent,
    TestResponsiveTabContainerComponent,
    TestObjectDetailsComponent,
    TestPanelComponent,
    TestQuickSearchComponent,
    TestObjectFormEditComponent,
    TestActionMenuComponent,
    TestAuditComponent,
    DmsObjectPickerComponent,
    TestContentPreviewComponent,
    TestObjectCreateComponent,
    TestUploadProgressOverlayComponent,
    TestFileDropComponent,
    TestRecentActivitiesComponent,
    TestAnimatedIconsComponent,
    TestIconsComponent,
    TestGroupedSelectComponent,
    TestUserAvatarComponent,
    TestLoadingSpinnerComponent,
    TestColumnConfigComponent,
    TestVersionListComponent,
    TestObjectDetailsCompareComponent,
    TestQuickfinderComponent,
    TestContextComponent,
    TestPopoverComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    YuvFrameworkModule.forRoot({
      main: ['assets/default/config/main.json'],
      translations: ['assets/default/i18n/'],
      environment
    }),
    YuvComponentsModule,
    YuvDirectivesModule,
    YuvGroupedSelectModule,
    YuvQuickfinderModule,
    YuvColumnConfigModule,
    YuvContextModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
