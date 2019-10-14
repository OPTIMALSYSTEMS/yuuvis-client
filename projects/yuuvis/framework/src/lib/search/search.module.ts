import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ActionModule } from '../actions/action.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvObjectFormModule } from '../object-form';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { SearchResultPanelComponent } from './search-result-panel/search-result-panel.component';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    OverlayPanelModule,
    ReactiveFormsModule,
    FormsModule,
    YuvObjectFormModule,
    TranslateModule,
    YuvComponentsModule,
    DropdownModule,
    YuvCommonUiModule,
    ActionModule,
    MultiSelectModule
  ],
  exports: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent]
})
export class YuvSearchModule {}
