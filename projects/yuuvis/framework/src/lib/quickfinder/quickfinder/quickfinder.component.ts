import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ReferenceEntry } from '../../form/elements/reference/reference.interface';

/**
 * Picker for quickly selecting one object. You may restrict the object types
 * allowed to be selected by setting the `allowedTargetTypes` input.
 *
 * This component is based on the `yuv-reference` form control. If you need to
 * select more than one object, you can use this component instead.
 *
 * [Screenshot](../assets/images/yuv-quickfinder.gif)
 *
 * @example
 * <yuv-quickfinder [label]="'Some label'" (objectSelect)="onObjectSelect($event)"></yuv-quickfinder>
 *
 *
 */
@Component({
  selector: 'yuv-quickfinder',
  templateUrl: './quickfinder.component.html',
  styleUrls: ['./quickfinder.component.scss']
})
export class QuickfinderComponent {
  /**
   * Label for the quickfinder input element
   */
  @Input() label: string;
  /**
   * Minimal number of characters to trigger search (default: 2)
   */
  @Input() minChars: number = 2;
  /**
   * Maximal number of suggestions for the given search term (default: 10)
   */
  @Input() maxSuggestions: number = 10;
  /**
   * Set this to true and the component will try to gain focus once it has been rendered.
   * Notice that this is not reliable. If there are any other components that are rendered
   * later and also try to be focused, they will 'win', because there can only be one focus.
   */
  @Input() autofocus: boolean;

  /**
   * Restrict the suggestions to a list of allowed target object types
   */
  @Input() allowedTargetTypes: string[] = [];

  /**
   * You can provide a template reference here that will be rendered at the end of each
   * quickfinder result item. Within the provided template you'll get an object
   * representing the current entry:
   *
   *     <ng-template #quickfinderEntryLinkTpl let-entry="entry">
   *          <a [routerLink]="['/context', entry.id]" title="Open '{{entry.title}}'">open</a>
   *     </ng-template>
   *
   *
   *
   * Use case: Add a router link of your host application that opens
   * the object in a new tab/window.
   */
  @Input() entryLinkTemplate: TemplateRef<any>;

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<ReferenceEntry>();

  onObjectSelected(entries: ReferenceEntry[]) {
    this.objectSelect.emit(entries && entries.length ? entries[0] : null);
  }
}
