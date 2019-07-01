import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimpleAccordionComponent } from './simple-accordion/simple-accordion.component';

@NgModule({
  declarations: [SimpleAccordionComponent],
  imports: [CommonModule],
  exports: [SimpleAccordionComponent]
})
export class AccordionModule {}
