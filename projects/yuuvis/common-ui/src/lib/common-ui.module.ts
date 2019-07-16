import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from './components/icon/icon.service';
import { IconComponent } from './components/icon/icon.component';
import { HttpClientModule } from '@angular/common/http';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [IconService],
  declarations: [IconComponent, FocusWithinDirective],
  exports: [IconComponent, FocusWithinDirective]
})
export class YuvCommonUiModule {}