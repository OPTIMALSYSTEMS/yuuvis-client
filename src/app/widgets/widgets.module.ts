import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvSearchModule } from '@yuuvis/framework';
import { QuickSearchWidgetComponent } from './quick-search-widget/quick-search-widget.component';

@NgModule({
  declarations: [QuickSearchWidgetComponent],
  exports: [QuickSearchWidgetComponent],
  imports: [CommonModule, YuvSearchModule]
})
export class YuvWidgetsModule {}
