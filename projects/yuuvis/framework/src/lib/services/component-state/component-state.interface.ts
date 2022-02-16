export interface ComponentState {
  id: string;
  component: string;
  params: ComponentStateParams;
}
export interface ComponentStateParams {
  actions?: {
    label: string;
    callback: () => void;
  }[];
  data?: any;
}

export interface ComponentStateChangeEvent {
  action: 'add' | 'remove' | 'update';
  state: ComponentState;
}
