# YuvActionModule

`YuvActionModule` contains components for creating an actions menu.
Actions will be provided by the `ActionMenuComponent`. Part of the module
are actions that can be triggered for example for DmsObjects.

## Add Actions

From your application you are able to extend the list of actions. The underlying `ActionService` is using an injection token called `ACTIONS`. This token can be used to add more actions.

First step is to create a module that declares your actions and then extend the `ACTIONS` token using `multiple: true`.

```ts
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
  ]
})
export class ActionsModule {}
```
