import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { SummaryComponent } from './summary/summary.component';

const objectDetails = [ObjectDetailsComponent, SummaryComponent, AuditComponent, ContentPreviewComponent];

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
    CalendarModule
  ],
  declarations: [...objectDetails],
  exports: [...objectDetails]
})
export class YuvObjectDetailsModule {}
