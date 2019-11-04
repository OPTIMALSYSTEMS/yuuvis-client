export interface ResponsiveMasterSlaveOptions {
  masterSize?: number;
  masterMinSize?: number;
  slaveSize?: number;
  slaveMinSize?: number;
  direction?: 'horizontal' | 'vertical';
  resizable?: boolean;
  useStateLayout?: boolean;
}
