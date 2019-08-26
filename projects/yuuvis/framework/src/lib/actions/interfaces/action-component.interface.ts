import {EventEmitter} from '@angular/core';

/**
 * Interface to be implemented by components contained by
 * ComponentActions and ExternalComponentActions
 */
export interface ActionComponent {
  selection: any[];
  finished: EventEmitter<any>;
  canceled: EventEmitter<any>;
}
