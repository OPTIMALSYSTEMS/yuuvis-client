import { NgModule } from '@angular/core';
import { DirectionDirective } from './direction/direction.directive';
import { OutsideClickDirective } from './outside-click/outside-click.directive';
@NgModule({
  declarations: [OutsideClickDirective, DirectionDirective],
  exports: [OutsideClickDirective, DirectionDirective]
})
export class YuvDirectivesModule {}
