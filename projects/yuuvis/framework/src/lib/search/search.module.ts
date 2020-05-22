import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@yuuvis/core';
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
import { SearchResultPanelComponent } from './search-result-panel/search-result-panel.component';
import { SearchResultComponent } from './search-result/search-result.component';

const searchComponents = [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent, QuickSearchPickerComponent];

@NgModule({
  declarations: [...searchComponents],
  exports: [...searchComponents],
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
    A11yModule
  ]
})
export class YuvSearchModule {}
