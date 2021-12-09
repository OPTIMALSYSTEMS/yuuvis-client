import { Injectable } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ComponentState, ComponentStateChangeEvent, ComponentStateParams } from './component-state.interface';

/**
 * Service for managing component states within an application.
 * In an app usually there are plenty components that will enter or leave across the
 * applications lifetime. Sometimes it is usefull for an app to know about existing
 * components and their current state to provide some additional features based on
 * whether or not a component has been rendered.
 *
 * Imagine you have an application that renders a classic master details page. Selecting
 * an item from the list (master) will update the details component. Id the details
 * component now propagates its state to the `ComponentStateService` the app itself (or any
 * other component) could act upon this state data. If for example the details component
 * fetches data from the backend and propagates this data through this service the app could
 * provide a set of features for this particular item or another component could visualize
 * this data in a different way (charts for example) without having to load the data again.
 *
 * EXAMPLE: The `ObjectDetailsComponent` provided by `@yuuvis/framework` will emit the `DmsObject`
 * loaded withing the component.
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentStateService {
  private componentStateChangeSource = new ReplaySubject<ComponentStateChangeEvent>();
  readonly componentStateChange$: Observable<ComponentStateChangeEvent> = this.componentStateChangeSource.asObservable();

  private componentStates: ComponentState[] = [];
  private componentStatesSource = new ReplaySubject<ComponentState[]>();
  readonly componentStates$: Observable<ComponentState[]> = this.componentStatesSource.asObservable();

  constructor() {}

  /**
   * Add a components state.
   * @param component The components name
   * @param data Data provided with the component
   * @returns ID that will be needed to reference this state entry later on (e.g. for
   * updating its data or remove it from the state service)
   */
  addComponentState(component: string, params: ComponentStateParams): string {
    const stateId = Utils.uuid();
    const state = {
      id: stateId,
      component,
      params
    };

    this.componentStates.push(state);
    this.componentStatesSource.next(this.componentStates);
    this.componentStateChangeSource.next({ action: 'add', state });
    return stateId;
  }

  /**
   * Removes a component state.
   * @param id ID of the component state you got when calling `componentEnter(...)`
   */
  removeComponentState(id: string) {
    const idx = this.componentStates.findIndex((s) => s.id === id);

    if (idx !== -1) {
      const delState = this.componentStates.splice(idx, 1);
      this.componentStatesSource.next(this.componentStates);
      this.componentStateChangeSource.next({ action: 'remove', state: delState[0] });
    }
  }

  /**
   * Update a components state.
   * @param id ID of the component state you got when calling `componentEnter(...)`
   * @param data New state data
   */
  updateComponentState(id: string, params: any) {
    const idx = this.componentStates.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.componentStates[idx] = { ...this.componentStates[idx], params };
      this.componentStatesSource.next(this.componentStates);
      this.componentStateChangeSource.next({ action: 'update', state: { ...this.componentStates[idx] } });
    }
  }
}
