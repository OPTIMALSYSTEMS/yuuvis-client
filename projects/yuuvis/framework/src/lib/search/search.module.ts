import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SearchResultComponent } from './search-result/search-result.component';
import { YuvComponentsModule } from '../components';

@NgModule({
  declarations: [QuickSearchComponent, SearchResultComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    OverlayPanelModule,
    YuvComponentsModule,
    YuvCommonUiModule
  ],
  exports: [QuickSearchComponent, SearchResultComponent]
})
export class YuvSearchModule { }
