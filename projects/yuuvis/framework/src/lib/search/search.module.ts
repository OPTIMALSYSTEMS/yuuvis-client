import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ActionModule } from '../actions/action.module';
import { YuvComponentsModule } from '../components/components.module';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { SearchResultPanelComponent } from './search-result-panel/search-result-panel.component';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TranslateModule,
    YuvComponentsModule,
    YuvCommonUiModule,
    ActionModule,
    MultiSelectModule
  ],
  exports: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent]
})
export class YuvSearchModule {}
