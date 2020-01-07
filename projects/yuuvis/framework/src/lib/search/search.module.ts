import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ActionModule } from '../actions/action.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFormModule } from '../form/form.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvPopoverModule } from '../popover/popover.module';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { ValuePickerItemComponent } from './quick-search/value-picker/value-picker-item/value-picker-item.component';
import { ValuePickerComponent } from './quick-search/value-picker/value-picker.component';
import { SearchResultPanelComponent } from './search-result-panel/search-result-panel.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { ObjectTypePickerComponent } from './quick-search/object-type-picker/object-type-picker.component';
@NgModule({
  declarations: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent, ValuePickerComponent, ValuePickerItemComponent, ObjectTypePickerComponent],
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
    YuvCommonUiModule,
    ActionModule,
    AutoCompleteModule,
    YuvFormModule,
    YuvDirectivesModule,
    YuvGroupedSelectModule
  ],
  exports: [QuickSearchComponent, SearchResultComponent, SearchResultPanelComponent]
})
export class YuvSearchModule {}
