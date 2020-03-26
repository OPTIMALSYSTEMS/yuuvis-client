import {Action} from './action.interface';

/**
 * Interface for entries of the action menu
 */
export interface ActionListEntry {
  /**
   * The action to be executed
   */
  action: Action;
  /**
   * Target type the ActionListEntry was created for.
   * For example DMS_OBJECT, INBOX_ITEM, ... [see: action-target.ts)
   */
  target: any;
  /**
   * Sub set of selected items for which the action is executable
   */
  availableSelection: any[]
}
