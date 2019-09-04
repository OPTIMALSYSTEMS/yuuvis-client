import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {PendingChangesComponent} from './pending-changes-component.interface';
import {PendingChangesService} from './pending-changes.service';

@Injectable()
export class PendingChangesGuard implements CanDeactivate<PendingChangesComponent> {

  constructor(private pendingChanges: PendingChangesService) {
  }

  canDeactivate(component: PendingChangesComponent): boolean {
    // if there are no pending changes, just allow deactivation; else confirm first
    return !this.pendingChanges.check(component);
  }
}
