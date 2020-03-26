import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AccordionModule } from 'primeng/accordion';
import { AboutComponent } from './component/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, TranslateModule, AccordionModule, YuvCommonUiModule]
})
export class AboutModule {}
