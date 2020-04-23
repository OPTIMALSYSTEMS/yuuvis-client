import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '@yuuvis/framework';
import { AccordionModule } from 'primeng/accordion';
import { AboutComponent } from './component/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, TranslateModule, AccordionModule, YuvCommonModule]
})
export class AboutModule {}
