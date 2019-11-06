import { NgModule } from '@angular/core';
import { FileDropDirective } from './file-drop/file-drop.directive';
import { OutsideClickDirective } from './outside-click/outside-click.directive';
@NgModule({
  declarations: [OutsideClickDirective, FileDropDirective],
  exports: [OutsideClickDirective, FileDropDirective]
})
export class YuvDirectivesModule {}
