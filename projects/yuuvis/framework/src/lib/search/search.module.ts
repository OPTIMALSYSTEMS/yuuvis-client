import { A11yModule } from '@angular/cdk/a11y';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { YuvActionModule } from '../actions/action.module';
import { YuvColumnConfigModule } from '../column-config/column-config.module';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFormModule } from '../form/form.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvPopoverModule } from '../popover/popover.module';
import { QuickSearchPickerComponent } from './quick-search/quick-search-picker/quick-search-picker.component';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { QuickSearchService } from './quick-search/quick-search.service';
import { SearchFilterConfigComponent } from './quick-search/search-filter-config/search-filter-config.component';
import { SearchFilterFormComponent } from './quick-search/search-filter-form/search-filter-form.component';
import { SearchFilterComponent } from './quick-search/search-filter/search-filter.component';
import { SearchResultPanelComponent } from './search-result-panel/search-result-panel.component';
import { SearchResultComponent } from './search-result/search-result.component';

const searchComponents = [
  QuickSearchComponent,
  SearchResultComponent,
  SearchResultPanelComponent,
  QuickSearchPickerComponent,
  SearchFilterComponent,
  SearchFilterConfigComponent,
  SearchFilterFormComponent
];
/**
 * Module providing components for extensible search of target object types, filter those objects and rendering a search result as well.
 *
 */
@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    YuvObjectFormModule,
    YuvPipesModule,
    TranslateModule,
    YuvComponentsModule,
    YuvPopoverModule,
    YuvCommonModule,
    YuvActionModule,
    AutoCompleteModule,
    YuvFormModule,
    YuvDirectivesModule,
    OverlayPanelModule,
    YuvColumnConfigModule,
    YuvGroupedSelectModule,
    A11yModule,
    AngularSplitModule,
    DragDropModule
  ],
  providers: [QuickSearchService],
  declarations: [...searchComponents],
  exports: [...searchComponents],
  entryComponents: [...searchComponents]
})
export class YuvSearchModule {}
