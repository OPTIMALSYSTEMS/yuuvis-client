import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule, SidebarModule } from 'primeng/primeng';
import { SimpleAccordionComponent } from './components/accordion/simple-accordion/simple-accordion.component';
import { IconComponent } from './components/icon/icon.component';
import { SidebarComponent } from './components/navigation/component/sidebar.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule, SidebarModule],
  declarations: [
    IconComponent,
    FocusWithinDirective,
    SimpleAccordionComponent,
    SidebarComponent
  ],
  exports: [
    IconComponent,
    FocusWithinDirective,
    SimpleAccordionComponent,
    SidebarComponent
  ]
})
export class YuvCommonUiModule {}
