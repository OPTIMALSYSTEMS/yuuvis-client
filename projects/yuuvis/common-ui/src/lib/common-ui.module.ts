import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './components/icon/icon.component';
import { HttpClientModule } from '@angular/common/http';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [IconComponent, FocusWithinDirective],
  exports: [IconComponent, FocusWithinDirective]
})
export class YuvCommonUiModule {}