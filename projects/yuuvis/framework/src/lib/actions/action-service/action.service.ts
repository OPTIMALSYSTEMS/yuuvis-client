import { ComponentFactoryResolver, Inject, Injectable, InjectionToken, ViewContainerRef } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { merge as observableMerge, Observable, of as observableOf } from 'rxjs';
import { combineAll, map } from 'rxjs/operators';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { Action } from '../interfaces/action.interface';
import { SelectionRange } from '../selection-range.enum';

export const ACTIONS = new InjectionToken<any[]>('ACTIONS');
export const CUSTOM_ACTIONS = new InjectionToken<any[]>('CUSTOM_ACTIONS');

@Injectable()
export class ActionService {
  private allActionComponents: any[] = [];

  constructor(
    @Inject(ACTIONS) actions: any[] = [],
    @Inject(CUSTOM_ACTIONS) custom_actions: any[] = [],
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.allActionComponents = actions.concat(custom_actions).filter(entry => entry.target && !entry.isSubAction && !entry.disabled);
  }

  getActionsList(selection: any[], viewContainerRef: ViewContainerRef): Observable<ActionListEntry[]> {
    // todo: find better solution to exclude components for actions that need to be initialized later
    return this.getExecutableActionsListFromGivenActions(this.allActionComponents, selection, viewContainerRef);
  }

  private createExecutableActionListEntry(actionComponent: any, selection: any[], viewContainerRef: ViewContainerRef): ActionListEntry {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(actionComponent);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    const entry: ActionListEntry = {
      action: componentRef.instance as Action,
      target: actionComponent.target,
      availableSelection: selection
    };
    return entry;
  }

  getExecutableActionsListFromGivenActions(allActionComponents: any[], selection: any[], viewContainerRef: ViewContainerRef): Observable<ActionListEntry[]> {
    if (selection && selection.length) {
      const allActionsList: ActionListEntry[] = allActionComponents
        .filter(actionComponent => selection[0] instanceof actionComponent.target)
        .map((actionComponent: any) => this.createExecutableActionListEntry(actionComponent, [], viewContainerRef));

      const targetActionsList = allActionsList.filter((actionListEntry: any) => selection[0] instanceof actionListEntry.target);
      const observables = [];
      targetActionsList.forEach(actionListEntry => {
        selection.forEach(item => {
          let observable = actionListEntry.action.isExecutable(item);
          observables.push(observable);
          observable.subscribe(res => {
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
            .filter(actionListEntry => this.isRangeAllowed(actionListEntry.action, actionListEntry.availableSelection.length))
            .sort(Utils.sortValues('action.priority'))
        )
      );
    } else {
      return observableOf([]);
    }
  }

  /**
   * Checks if the action is allowed for single ot multiple selection
   * @param action
   * @param itemsCount
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
