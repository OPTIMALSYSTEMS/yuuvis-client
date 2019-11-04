import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { YuvDirectivesModule, YuvFrameworkModule } from '@yuuvis/framework';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DmsObjectPickerComponent } from './components/dms-object-picker/dms-object-picker.component';
import { TestActionMenuComponent } from './test-action-menu/test-action-menu.component';
import { TestAuditComponent } from './test-audit/test-audit.component';
import { TestContentPreviewComponent } from './test-content-preview/test-content-preview.component';
import { TestObjectCreateComponent } from './test-object-create/test-object-create.component';
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
import { TestFileDropComponent } from './test-file-drop/test-file-drop.component';

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
    TestFileDropComponent
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
    YuvDirectivesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
