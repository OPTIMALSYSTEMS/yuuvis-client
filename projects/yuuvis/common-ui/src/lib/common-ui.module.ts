import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/primeng';
import { SimpleAccordionComponent } from './components/accordion/simple-accordion/simple-accordion.component';
import { IconComponent } from './components/icon/icon.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule],
  declarations: [IconComponent, FocusWithinDirective, SimpleAccordionComponent],
  exports: [IconComponent, FocusWithinDirective, SimpleAccordionComponent]
})
export class YuvCommonUiModule {}
