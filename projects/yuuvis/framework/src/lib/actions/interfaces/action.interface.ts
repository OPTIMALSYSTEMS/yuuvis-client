import { Type } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectionRange } from '../selection-range.enum';
/**
 * @ignore
 */
export interface BaseAction {
  target?: Function;
  isSubAction?: boolean;
  disabled?: boolean;
}

/**
 * Base interface for actions inside the action menu
 */
export interface Action extends BaseAction {
  /**
   * label to be displayed inside the action menu
   */
  label: string;
  /**
   * description to be displayed inside the action menu
   */
  description: string;
  /**
   * @ignore
   */
  iconSrc?: string;
  /**
   * actions priority defining the position of the action within the whole list of actions
   */
  priority: number;
  /**
   * group of actions the action should be part of ('common' or 'further')
   */
  group: string;
  /**
   * number of selected items supported by the action
   * (SelectionRange.SINGLE_SELECT, SelectionRange.MULTI_SELECT, SelectionRange.MULTI_SELECT_ONLY )
   */
  range: SelectionRange;
  /**
   * Determining whether or not the action is executable for the given selection
   * @param item Current selection
   * @returns true if the action is executable for the current selection, false otherwise
   */
  isExecutable: (item: any) => Observable<boolean>;
}

/**
 * Action that executes the code of its run method
 */
export interface SimpleAction extends Action {
  /**
   * Do something when the action has been clicked
   * @param selection Selected items
   */
  run(selection: any[]): Observable<boolean>;
  // finished: EventEmitter<any>;
}
/**
 * @ignore
 */
export interface SimpleCustomAction extends SimpleAction {
  action: any;
}

/**
 * Action containing a component that will be displayed on action execution
 * inside the action menu
 */
export interface ComponentAction extends Action {
  /**
   * Component to be rendered
   */
  component: Type<any>;
  /**
   * Component input values
   */
  inputs?: any;
}

/**
 * Action containing a component that will be displayed on action execution
 * inside a modal dialog
 */
export interface ExternalComponentAction extends Action {
  /**
   * Component to be injected into the dialog
   */
  extComponent: Type<any>;
  /**
   * Component input values
   */
  inputs?: any;
}

/**
 * Action that executes a redirect to an URI
 */
export interface LinkAction extends Action {
  /**
   * Get Link URI for given selection
   * @param selection Selected items
   * @returns The generated Link
   */
  getLink(selection: any[]): string;

  /**
   * Params to be attached to the link.
   * @param selection Selected items
   * @returns Object of params (key/value)
   */
  getParams?(selection: any[]): any;

  /**
   * Fragment to be attached to the link.
   * @param selection Selected items
   * @returns the fragment
   */
  getFragment?(selection: any[]): string;
}

/**
 * Action that contains a set of sub actions
 */
export interface ListAction extends Action {
  /**
   * Header title for the list of sub actions
   */
  header: string;
  /**
   * Sub action list item components
   */
  subActionComponents: any[];
}
