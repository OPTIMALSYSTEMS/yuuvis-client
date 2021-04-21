import { ComponentFactoryResolver, Inject, Injectable, InjectionToken, ViewContainerRef } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { merge as observableMerge, Observable, of as observableOf, of } from 'rxjs';
import { combineAll, map, switchMap, tap } from 'rxjs/operators';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { Action } from '../interfaces/action.interface';
import { SelectionRange } from '../selection-range.enum';
import { PluginActionComponent } from './../../plugins/plugin-action.component';
import { PluginsService } from './../../plugins/plugins.service';

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
    private _componentFactoryResolver: ComponentFactoryResolver,
    private pluginsService: PluginsService
  ) {}

  /**
   * Get the list of all available actions
   *
   * @param selection - selection of the action for selected object
   * @param viewContainerRef - Anchor element that specifies the location of this container in the containing view.
   * Each view container can have only one anchor element, and each anchor element
   * can have only a single view container.
   */
  getActionsList(selection: any[], viewContainerRef: ViewContainerRef): Observable<ActionListEntry[]> {
    // todo: find better solution to exclude components for actions that need to be initialized later
    return this.getPluginActions().pipe(switchMap((_) => this.getExecutableActionsListFromGivenActions(this.allActionComponents, selection, viewContainerRef)));
  }

  private getPluginActions() {
    return !this.pluginActionsLoaded
      ? this.pluginsService.getCustomPlugins('actions').pipe(
          map((_actions: any[]) => PluginActionComponent.actionWrapper(_actions)),
          tap((_actions) => {
            this.allActionComponents = []
              .concat(...this.actions)
              .concat(this.custom_actions)
              .concat(_actions)
              .filter((entry) => entry.target && !entry.isSubAction && !entry.disabled);
            this.pluginActionsLoaded = true;
          })
        )
      : of(null);
  }

  private createExecutableActionListEntry(actionComponent: any, selection: any[], viewContainerRef: ViewContainerRef): ActionListEntry {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(actionComponent._component || actionComponent);
    const componentRef = viewContainerRef.createComponent(componentFactory);

    if (componentRef.instance instanceof PluginActionComponent) {
      componentRef.instance.action = actionComponent.action;
    }
    const entry: ActionListEntry = {
      action: componentRef.instance as Action,
      target: actionComponent.target,
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
    if (selection && selection.length) {
      const allActionsList: ActionListEntry[] = allActionComponents
        .filter((actionComponent) => selection[0] instanceof actionComponent.target)
        .map((actionComponent: any) => this.createExecutableActionListEntry(actionComponent, [], viewContainerRef));

      const targetActionsList = allActionsList.filter((actionListEntry: any) => selection[0] instanceof actionListEntry.target);
      const observables = [];
      targetActionsList.forEach((actionListEntry) => {
        selection.forEach((item) => {
          let observable = actionListEntry.action.isExecutable(item);
          observables.push(observable);
          observable.subscribe((res) => {
            if (res) {
              actionListEntry.availableSelection.push(item);
            }
          });
        });
      });

      return observableMerge(observables).pipe(
        combineAll(),
        map(() =>
          targetActionsList
            .filter((actionListEntry) => this.isRangeAllowed(actionListEntry.action, actionListEntry.availableSelection.length))
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
  private isRangeAllowed(action, itemsCount) {
    let isRangeAllowed = true;
    switch (action.range) {
      case SelectionRange.SINGLE_SELECT:
        isRangeAllowed = itemsCount === 1;
        break;
      case SelectionRange.MULTI_SELECT:
        isRangeAllowed = itemsCount >= 1;
        break;
      case SelectionRange.MULTI_SELECT_ONLY:
        isRangeAllowed = itemsCount > 1;
        break;
      default:
        break;
    }
    return isRangeAllowed;
  }
}
