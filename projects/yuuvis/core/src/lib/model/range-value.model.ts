import { SearchFilter } from '../service/search/search-query.model';

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

  /**
   * Get the label for a given operator
   * @param operator The operator to retrieve the label for
   * @returns The corresponding label
   */
  public static getOperatorLabel(operator: string) {
    let label = '?';
    switch (operator) {
      case SearchFilter.OPERATOR.EQUAL: {
        label = '=';
        break;
      }
      case SearchFilter.OPERATOR.GREATER_OR_EQUAL: {
        label = '>=';
        break;
      }
      case SearchFilter.OPERATOR.LESS_OR_EQUAL: {
        label = '<=';
        break;
      }
      case SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH: {
        label = '-';
        break;
      }
    }
    return label;
  }
}
