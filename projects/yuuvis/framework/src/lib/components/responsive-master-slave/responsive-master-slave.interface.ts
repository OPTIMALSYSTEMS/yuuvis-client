/**
 * Input data for rendering a responsive master-slave-view.
 */
export interface ResponsiveMasterSlaveOptions {
  /**
   * Size of a master part. If a number is provided, pixel units are assumed.
   */
  masterSize?: number;
  /**
   * Minimal possible size of a master part. If a number is provided, pixel units are assumed.
   */
  masterMinSize?: number;

  /**
   * Size of slave part. If a number is provided, pixel units are assumed.
   */

  slaveSize?: number;
  /**
   * Minimal possible size of a slave part. If a number is provided, pixel units are assumed.
   */
  slaveMinSize?: number;
  /**
   * The direction this master-slave-view can take when resizing the screen
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Resizable or not this master-slave-view
   */
  resizable?: boolean;
  useStateLayout?: boolean;
}
