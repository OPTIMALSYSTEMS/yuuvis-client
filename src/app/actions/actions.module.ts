import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ACTIONS } from '@yuuvis/framework';
import { ClipboardActionComponent } from './clipboard/clipboard-action';
import { ClipboardLinkActionComponent } from './clipboard/clipboard-link-action';
import { OpenContextActionComponent } from './open-context-action/open-context-action';
import { OpenVersionsActionComponent } from './open-versions-action/open-versions-action';

// Array of actions provided by the client app
export const appActionsComponents = [OpenContextActionComponent, OpenVersionsActionComponent, ClipboardActionComponent, ClipboardLinkActionComponent];

@NgModule({
  declarations: appActionsComponents,
  imports: [CommonModule],
  providers: [
    {
      provide: ACTIONS,
      useValue: appActionsComponents,
      multi: true
    }
  ],
  entryComponents: appActionsComponents
})
export class ActionsModule {}
