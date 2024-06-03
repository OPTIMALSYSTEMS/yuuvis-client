import { Injectable } from '@angular/core';

import { PendingChangesComponent } from './pending-changes-component.interface';
import { PendingChangesService } from './pending-changes.service';
/**
 * Providing a `PendingChangesComponent`.
 */
@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard  {
  constructor(private pendingChanges: PendingChangesService) {}

  canDeactivate(component: PendingChangesComponent): boolean {
    // if there are no pending changes, just allow deactivation; else confirm first
    return !this.pendingChanges.check(component);
  }
}
