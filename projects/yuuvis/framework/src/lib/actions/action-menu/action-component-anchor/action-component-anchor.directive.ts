import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[eoActionComponentAnchor]'
})
export class ActionComponentAnchorDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
