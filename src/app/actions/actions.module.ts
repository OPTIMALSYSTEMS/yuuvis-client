import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ACTIONS, YuvComponentRegister } from '@yuuvis/framework';
import { ClipboardActionComponent } from './clipboard/clipboard-action';
import { ClipboardLinkActionComponent } from './clipboard/clipboard-link-action';
import { OpenContextActionComponent } from './open-context-action/open-context-action';
import { OpenVersionsActionComponent } from './open-versions-action/open-versions-action';
import { RestoreActionComponent } from './restore-action/restore-action';

// Array of actions provided by the client app
export const appActionsComponents = [
  OpenContextActionComponent,
  OpenVersionsActionComponent,
  ClipboardActionComponent,
  ClipboardLinkActionComponent,
  RestoreActionComponent
];

YuvComponentRegister.register(appActionsComponents);

@NgModule({
  declarations: appActionsComponents,
  imports: [CommonModule],
  providers: [
    {
      provide: ACTIONS,
      useValue: appActionsComponents,
      multi: true
    }
  ]
})
export class ActionsModule {}
