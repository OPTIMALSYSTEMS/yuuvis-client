import { NgModule } from '@angular/core';
import { OutsideClickDirective } from './outside-click/outside-click.directive';
@NgModule({
  declarations: [OutsideClickDirective],
  exports: [OutsideClickDirective]
})
export class YuvDirectivesModule {}
