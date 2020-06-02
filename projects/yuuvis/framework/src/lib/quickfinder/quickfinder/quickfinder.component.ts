import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ReferenceEntry } from '../../form/elements/reference/reference.interface';

/**
 * Picker for quickly selecting an object.
 */
@Component({
  selector: 'yuv-quickfinder',
  templateUrl: './quickfinder.component.html',
  styleUrls: ['./quickfinder.component.scss']
})
export class QuickfinderComponent {
  /**
   * Label for the quickfinder
   */
  @Input() label: string;
  /**
   * Minimal number of characters to trigger search (default: 2)
   */
  @Input() minChars: number = 2;

  /**
   * Wheter or not to support selection of multiple references
   */
  @Input() multiple: boolean;
  /**
   * Maximal number of suggestions for the given search term (default: 10)
   */
  @Input() maxSuggestions: number = 10;

  /**
   * Restrict the suggestions to a list of allowed target object types
   */
  @Input() allowedTargetTypes: string[] = [];

  /**
   * You can provide a template reference here that will be rendered at the end of each
   * quickfinder result item. Within the provided template you'll get an object
   * representing the current entry:
   *
   * ```html
   * <ng-template #quickfinderEntryLinkTpl let-entry="entry">
   *   <a [routerLink]="['/context', entry.id]" title="Open '{{entry.title}}'">open</a>
   * </ng-template>
   * ```
   *
   * Use case: Add a router link of your host application that opens
   * the object in a new tab/window.
   */
  @Input() entryLinkTemplate: TemplateRef<any>;

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<ReferenceEntry>();
}
