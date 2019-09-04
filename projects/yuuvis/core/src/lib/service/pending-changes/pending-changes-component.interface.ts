/**
 * Interface to be implemented by all components (state components) that are aware of pending changes
 */

export interface PendingChangesComponent {
  hasPendingChanges: () => boolean;
}
