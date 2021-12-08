export interface ComponentState {
  id: string;
  component: string;
  data: any;
}

export interface ComponentStateChangeEvent {
  action: 'add' | 'remove' | 'update';
  state: ComponentState;
}
