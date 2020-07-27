import { EventEmitter } from '@angular/core';

/**
 * Interface to be implemented by components contained by
 * ComponentActions and ExternalComponentActions
 */
export interface ActionComponent {
  /**
   * selection an action
   */
  selection: any[];
  /**
   * finish some action
   */
  finished: EventEmitter<any>;
  /**
   * cancel some action
   */
  canceled: EventEmitter<any>;
}
