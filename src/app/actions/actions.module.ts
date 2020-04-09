import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ACTIONS } from '@yuuvis/framework';
import { OpenContextActionComponent } from './open-context-action/open-context-action';

// Array of actions provided by the client app
export const appActionsComponents = [OpenContextActionComponent];

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
