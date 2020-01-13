import { NgModule } from '@angular/core';
import { FileDropDirective } from './file-drop/file-drop.directive';
import { OfflineDisabledDirective } from './offline-disabled/offline-disabled.directive';
import { OutsideClickDirective } from './outside-click/outside-click.directive';
@NgModule({
  declarations: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective],
  exports: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective]
})
export class YuvDirectivesModule {}
