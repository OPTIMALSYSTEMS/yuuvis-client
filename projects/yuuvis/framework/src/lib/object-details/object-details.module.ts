import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AccordionModule } from 'primeng/accordion';
import { YuvComponentsModule } from '../components';
import { YuvPipesModule } from '../pipes/pipes.module';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  imports: [CommonModule, AccordionModule, YuvComponentsModule, YuvPipesModule, YuvCommonUiModule, TranslateModule, FormsModule],
  declarations: [ObjectDetailsComponent, SummaryComponent],
  exports: [ObjectDetailsComponent, SummaryComponent]
})
export class YuvObjectDetailsModule {}
