import { NgModule } from '@angular/core';
import { ComponentAnchorDirective } from './component-anchor/component-anchor.directive';
import { FileDropDirective } from './file-drop/file-drop.directive';
import { FocusFirstDirective } from './focus-first/focus-first.directive';
import { OfflineDisabledDirective } from './offline-disabled/offline-disabled.directive';
import { OutsideClickDirective } from './outside-click/outside-click.directive';
import { TextOverflowTitleDirective } from './text-overflow-title/text-overflow-title.directive';

/**
 * `YuvDirectivesModule` contains directives that may be applied to any DOM element.
 */
@NgModule({
  declarations: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective, FocusFirstDirective, ComponentAnchorDirective, TextOverflowTitleDirective],
  exports: [OutsideClickDirective, FileDropDirective, OfflineDisabledDirective, FocusFirstDirective, ComponentAnchorDirective, TextOverflowTitleDirective]
})
export class YuvDirectivesModule {}
