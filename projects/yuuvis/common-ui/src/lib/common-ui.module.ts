import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { IconComponent } from './components/icon/icon.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [IconComponent, FocusWithinDirective],
  exports: [IconComponent, FocusWithinDirective]
})
export class YuvCommonUiModule {}
