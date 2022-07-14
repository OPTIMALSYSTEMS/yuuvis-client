import { Inject, Injectable, InjectionToken, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DmsObject, RetentionField, Utils } from '@yuuvis/core';
import { merge as observableMerge, Observable, of as observableOf, of } from 'rxjs';
import { combineAll, map, switchMap, tap } from 'rxjs/operators';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { Action } from '../interfaces/action.interface';
import { SelectionRange } from '../selection-range.enum';
import { PluginActionComponent } from './../../plugins/plugin-action.component';
import { PluginsService } from './../../plugins/plugins.service';
import { YuvComponentRegister } from './../../shared/utils/utils';

export const ACTIONS = new InjectionToken<any[]>('ACTIONS');
export const CUSTOM_ACTIONS = new InjectionToken<any[]>('CUSTOM_ACTIONS');

/** @ignore
 * Use ActionService to provide `actions` for an action menu
 */

@Injectable()
export class ActionService {
  private allActionComponents: any[] = [];
  private pluginActionsLoaded: boolean;
  /**
   * @ignore
   */
  constructor(
    @Inject(ACTIONS) private actions: any[] = [],
    @Inject(CUSTOM_ACTIONS) private custom_actions: any[] = [],
    private pluginsService: PluginsService,
    private router: Router
  ) {}

  /**
   * Get the list of all available actions
   *
   * @param selection - selection of the action for selected object
   * @param viewContainerRef - Anchor element that specifies the location of this container in the containing view.
   * Each view container can have only one anchor element, and each anchor element
   * can have only a single view container.
   * @param skipActions List of actions (IDs) that should be excluded
   */
  getActionsList(selection: any[], viewContainerRef: ViewContainerRef, skipActions?: string[]): Observable<ActionListEntry[]> {
    // todo: find better solution to exclude components for actions that need to be initialized later
    return this.getPluginActions().pipe(
      switchMap((_) => this.getExecutableActionsListFromGivenActions(this.allActionComponents, selection, viewContainerRef)),
      map((res: ActionListEntry[]) => (skipActions ? res.filter((a) => !skipActions.includes(a.id)) : res))
    );
  }

  private getPluginActions() {
    return !this.pluginActionsLoaded
      ? this.pluginsService.getCustomPlugins('actions').pipe(
          map((_actions: any[]) => PluginActionComponent.actionWrapper(_actions)),
          tap((_actions: any[]) => {
            const availableActions = [].concat(...this.actions);
            // set action selector as ID
            availableActions.forEach((a) => (a.id = YuvComponentRegister.getSelector(a)));
            window['_availableActions'] = availableActions.map((a) => a.id);
            // in case there are plugin actions, original actions are visible only if specific IDs are included in the list OR '*' means include all
            this.allActionComponents = []
              .concat(availableActions.filter((originalAction) => (!_actions.includes('*') && _actions.length ? _actions.includes(originalAction.id) : true)))
              .concat(this.custom_actions)
              .concat(_actions)
              .filter((entry) => entry.target && !entry.isSubAction && !entry.disabled);

            this.pluginActionsLoaded = true;
          })
        )
      : of(null);
  }

  private createExecutableActionListEntry(actionComponent: any, selection: any[], viewContainerRef: ViewContainerRef): ActionListEntry {
    const componentRef = viewContainerRef.createComponent(actionComponent._component || actionComponent);

    if (componentRef.instance instanceof PluginActionComponent) {
      componentRef.instance.action = actionComponent.action;
    }
    const entry: ActionListEntry = {
      action: componentRef.instance as Action,
      target: actionComponent.target,
      id: actionComponent.id,
      availableSelection: selection
    };
    return entry;
  }
  /**
   * Get the list of executable actions
   * @param allActionComponents - components, that providing actions
   * @param selection - selection of the action for selected object
   * @param viewContainerRef - Anchor element that specifies the location of this container in the containing view.
   * Each view container can have only one anchor element, and each anchor element
   * can have only a single view container.
   */
  getExecutableActionsListFromGivenActions(allActionComponents: any[], selection: any[], viewContainerRef: ViewContainerRef): Observable<ActionListEntry[]> {
    if (selection) {
      const targetFilter = (actionComponent: any) => (selection[0] ? selection[0] instanceof actionComponent.target : true);

      const allActionsList: ActionListEntry[] = allActionComponents
        .filter(targetFilter)
        .map((actionComponent: any) => this.createExecutableActionListEntry(actionComponent, [], viewContainerRef));

      const targetActionsList = allActionsList.filter(targetFilter);
      const observables = [of({})];
      targetActionsList.forEach((actionListEntry) => {
        selection.forEach((item) => {
          let observable = actionListEntry.action.isExecutable(item).pipe(
            tap((res) => {
              if (res) {
                actionListEntry.availableSelection.push(item);
              }
            })
          );
          observables.push(observable);
        });
      });

      return observableMerge(observables).pipe(
        combineAll(),
        map(() =>
          targetActionsList
            .filter((actionListEntry) => this.isRangeAllowed(actionListEntry.action, actionListEntry.availableSelection.length, selection?.length))
            .sort(Utils.sortValues('action.priority'))
        )
      );
    } else {
      return observableOf([]);
    }
  }

  /**
   * Checks if the action is allowed for single ot multiple selection
   * @param action It is an action that will be provided
   * @param itemsCount The count of selected items, for which the user wants to perform some action
   * @returns
   */
  private isRangeAllowed(action: Action, itemsCount: number, length: number) {
    let isRangeAllowed = itemsCount > 0;
    switch (action.range) {
      case SelectionRange.SINGLE_SELECT:
        isRangeAllowed = itemsCount === 1 && length === 1;
        break;
      case SelectionRange.MULTI_SELECT:
        isRangeAllowed = itemsCount >= 1;
        break;
      case SelectionRange.MULTI_SELECT_ONLY:
        isRangeAllowed = itemsCount > 1;
        break;
      case SelectionRange.ANY:
        isRangeAllowed = itemsCount === length;
        break;
      default:
        break;
    }
    return isRangeAllowed;
  }

  isExecutableSync(action: string, element: DmsObject): boolean {
    // delete object action
    if (action === 'yuv-delete-action') {
      let isRetentionActive = false;
      if (element.data[RetentionField.RETENTION_START] && element.data[RetentionField.RETENTION_END]) {
        const currentDate = new Date();
        const retentionStart = new Date(element.data[RetentionField.RETENTION_START]);
        const retentionEnd = new Date(element.data[RetentionField.RETENTION_END]);
        isRetentionActive = retentionStart <= currentDate && currentDate <= retentionEnd;
      }
      const validState = !/\/inbox|\/processes/.test(this.router.url);
      return validState && element && element.rights && element.rights.deleteObject && !isRetentionActive;
    }
  }
}
