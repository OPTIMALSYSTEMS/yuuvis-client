export interface DashboardWorkspace {
  id: string;
  label: string;
  grid: string;
}

// the config that will be persisted
export interface DashboardWorkspaceConfig {
  currentWorkspace: string;
  workspaces: Array<DashboardWorkspace>;
}

export const WIDGET_EVT_QUICKSEARCH_EXECUTE = 'yuv.framework.widget.event.quicksearch.execute';
