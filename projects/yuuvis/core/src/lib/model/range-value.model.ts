/**
 * Value class to be used with form elements that support ranges
 */
export class RangeValue {
  /**
   * Creates new instance
   * @param operator The operator (see @link SearchFilter.OPERATOR)
   * @param firstValue The rages first/start value
   * @param secondValue The ranges last/end value
   */

  constructor(public operator: string, public firstValue: string, public secondValue?: string) {}
}
