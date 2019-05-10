import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@NgModule({
  declarations: [QuickSearchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    OverlayPanelModule,
    YuvCommonUiModule
  ],
  exports: [QuickSearchComponent]
})
export class YuvSearchModule { }
