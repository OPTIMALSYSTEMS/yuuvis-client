export class Utils {
  public static isEdge(): boolean {
    return !!navigator.userAgent && navigator.userAgent.indexOf('Edge') > -1;
  }

  public static isEmpty(obj) {
    if (obj == null || obj === '') {
      return true;
    }

    if (typeof obj === 'number') {
      return isNaN(obj);
    }

    return typeof obj === 'boolean' ? false : !Object.keys(obj).length;
  }

  public static isEmptyOrFalse(val) {
    return typeof val === 'boolean' ? !val : Utils.isEmpty(val);
  }

  public static uniqeOnjectArray(array, comparator) {
    const result = [];
    const map = new Map();
    for (const item of array) {
      if (!map.has(item[comparator])) {
        map.set(item[comparator], true);
        result.push(item);
      }
    }
    return result;
  }
}
