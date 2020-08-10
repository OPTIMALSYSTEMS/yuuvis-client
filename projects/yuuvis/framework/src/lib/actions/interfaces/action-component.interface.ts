import { EventEmitter } from '@angular/core';

/**
 * Interface to be implemented by components contained by
 * ComponentActions and ExternalComponentActions
 */
export interface ActionComponent {
  /**
   * Selection of e.g. list items that will be applied to the action
   */
  selection: any[];
  /**
   * Emitted once the action has been finished
   */
  finished: EventEmitter<any>;
  /**
   * Emitted once the action has been canceled
   */
  canceled: EventEmitter<any>;
}
