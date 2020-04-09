import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { ActionModule } from '../actions/action.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFormModule } from '../form/form.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { AuditComponent } from './audit/audit.component';
import { ContentPreviewComponent } from './content-preview/content-preview.component';
import { ObjectDetailsCompareComponent } from './object-details-compare/object-details-compare.component';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { SummaryComponent } from './summary/summary.component';
import { SummarySectionComponent } from './summary/summary-section/summary-section.component';

const objectDetails = [ObjectDetailsComponent, ObjectDetailsCompareComponent, SummaryComponent, AuditComponent, ContentPreviewComponent];

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    YuvComponentsModule,
    YuvDirectivesModule,
    YuvPipesModule,
    ReactiveFormsModule,
    YuvFormModule,
    YuvCommonUiModule,
    TranslateModule,
    FormsModule,
    YuvObjectFormModule,
    ActionModule,
    RouterModule,
    CalendarModule
  ],
  declarations: [...objectDetails, ObjectDetailsCompareComponent, SummarySectionComponent],
  exports: [...objectDetails]
})
export class YuvObjectDetailsModule {}
