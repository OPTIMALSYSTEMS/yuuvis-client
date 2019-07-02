import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { YuvComponentsModule } from '../components';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [QuickSearchComponent, SearchResultComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TranslateModule,
    OverlayPanelModule,
    YuvComponentsModule,
    YuvCommonUiModule
  ],
  exports: [QuickSearchComponent, SearchResultComponent]
})
export class YuvSearchModule {}
