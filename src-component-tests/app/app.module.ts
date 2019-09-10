import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { YuvFrameworkModule } from '@yuuvis/framework';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppInterceptor } from './app.interceptor';
import { TestObjectDetailsComponent } from './test-object-details/test-object-details.component';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';
import { TestPanelComponent } from './test-panel/test-panel.component';
import { TestResponsiveTabContainerComponent } from './test-responsive-tab-container/test-responsive-tab-container.component';
import { TestSearchResultPanelComponent } from './test-search-result-panel/test-search-result-panel.component';
import { TestSearchResultComponent } from './test-search-result/test-search-result.component';
import { TestSummaryComponent } from './test-summary/test-summary.component';
import { TestQuickSearchComponent } from './test-quick-search/test-quick-search.component';
import { TestObjectFormEditComponent } from './test-object-form-edit/test-object-form-edit.component';

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
    TestObjectFormEditComponent
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
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
