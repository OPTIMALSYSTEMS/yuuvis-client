import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { ActionModule } from '../actions';
import { YuvComponentsModule } from '../components';
import { YuvPipesModule } from '../pipes/pipes.module';
import { HistoryFilterComponent } from './history/history-filter/history-filter.component';
import { HistoryFilterPipe } from './history/history-filter/pipe/HistoryFilter.pipe';
import { HistoryComponent } from './history/history.component';
import { TimelineEntryComponent } from './history/timeline-entry/timeline-entry.component';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  imports: [ActionModule, CommonModule, YuvComponentsModule, YuvPipesModule, YuvCommonUiModule, TranslateModule, FormsModule],
  declarations: [ObjectDetailsComponent, SummaryComponent, HistoryComponent, TimelineEntryComponent, HistoryFilterComponent, HistoryFilterPipe],
  exports: [ObjectDetailsComponent, SummaryComponent, HistoryComponent, TimelineEntryComponent, HistoryFilterComponent, HistoryFilterPipe]
})
export class YuvObjectDetailsModule { }
