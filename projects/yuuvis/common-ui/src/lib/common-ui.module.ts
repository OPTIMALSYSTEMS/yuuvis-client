import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule } from './components/accordion/accordion.module';
import { IconComponent } from './components/icon/icon.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [IconComponent, FocusWithinDirective],
  exports: [IconComponent, FocusWithinDirective, AccordionModule]
})
export class YuvCommonUiModule {}
