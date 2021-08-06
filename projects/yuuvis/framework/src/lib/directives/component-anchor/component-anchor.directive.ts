import { Directive, ViewContainerRef } from '@angular/core';

/**
 * @ignore
 */
@Directive({
  selector: '[yuvComponentAnchor]'
})
export class ComponentAnchorDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
