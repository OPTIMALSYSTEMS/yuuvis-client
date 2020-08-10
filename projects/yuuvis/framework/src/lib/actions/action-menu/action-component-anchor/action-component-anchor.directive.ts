import { Directive, ViewContainerRef } from '@angular/core';
/**
 * @ignore
 */
@Directive({
  selector: '[eoActionComponentAnchor]'
})
export class ActionComponentAnchorDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
