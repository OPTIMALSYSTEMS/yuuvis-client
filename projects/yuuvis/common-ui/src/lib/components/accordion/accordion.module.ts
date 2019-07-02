import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccordionModule as PrimeAccordionModule } from 'primeng/accordion';
import { SimpleAccordionComponent } from './simple-accordion/simple-accordion.component';

@NgModule({
  declarations: [SimpleAccordionComponent],
  imports: [CommonModule, PrimeAccordionModule],
  exports: [SimpleAccordionComponent]
})
export class YuvAccordionModule {}
