import { NgModule } from '@angular/core';
import { FileDropDirective } from './file-drop/file-drop.directive';
import { FocusFirstDirective } from './focus-first/focus-first.directive';
import { OfflineDisabledDirective } from './offline-disabled/offline-disabled.directive';
import { OutsideClickDirective } from './outside-click/outside-click.directive';

/**
 * `YuvDirectivesModule` contains directives that may be applied to any DOM element.
 */
@NgModule({
  declarations: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective, FocusFirstDirective],
  exports: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective, FocusFirstDirective]
})
export class YuvDirectivesModule {}
