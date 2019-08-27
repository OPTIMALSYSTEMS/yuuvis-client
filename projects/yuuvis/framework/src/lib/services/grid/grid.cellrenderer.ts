import { Utils } from '@yuuvis/core';

export class CellRenderer {
  static render(type: string, param: any, newParam?: any) {
    return CellRenderer[type + 'CellRenderer'](...param, ...newParam);
  }

  static filesizeCellRenderer(param) {
    return param.value ? param.context.fileSizePipe.transform(param.value) : '';
  }

  static numberCellRenderer(param) {
    if (param.value || param.value === 0) {
      // TODO: Reactive once ranges are supported ... or remove if they don't

      //   if (param.value.operator) {
      //     // range value from search form table
      //     return param.value.operator ===
      //       SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH
      //       ? CellRenderer.numberCellRendererTemplate(
      //           param.value.firstValue,
      //           param.context,
      //           param.grouping,
      //           param.pattern,
      //           param.scale
      //         ) +
      //           ' ' +
      //           RangeValue.getOperatorLabel(param.value.operator) +
      //           ' ' +
      //           CellRenderer.numberCellRendererTemplate(
      //             param.value.secondValue,
      //             param.context,
      //             param.grouping,
      //             param.pattern,
      //             param.scale
      //           )
      //       : RangeValue.getOperatorLabel(param.value.operator) +
      //           ' ' +
      //           CellRenderer.numberCellRendererTemplate(
      //             param.value.firstValue,
      //             param.context,
      //             param.grouping,
      //             param.pattern,
      //             param.scale
      //           );
      //   } else {
      return CellRenderer.numberCellRendererTemplate(param.value, param.context, param.grouping, param.pattern, param.scale);
      //   }
    } else {
      return '';
    }
  }

  static numberCellRendererTemplate(value, context, grouping?, pattern?, scale?): string {
    let numbers = context.numberPipe.transform(value, grouping, pattern, scale, `1.${scale || 0}-${scale || 0}`);
    return this.multiSelectCellRenderer(numbers);
  }

  static typeCellRenderer(param, customTooltip?) {
    const val =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V8h14v10z"/><path fill="none" d="M0 0h24v24H0z"/></svg>';
    let tooltip: string;
    if (param && param.value && !customTooltip) {
      const objectType = param.context.system.getObjectType(param.value);
      if (!objectType) {
        return val;
      }
      tooltip = param.context.system.getLocalizedResource(`${objectType.id}_label`);
      // TODO: Get object type icons from resources service
      // return val;
      // return CellRenderer.iconCellRenderer(
      //   Object.assign({}, param, { value: objectType })
      // );
    } else if (customTooltip) {
      tooltip = customTooltip;
    }
    return `<span title="${tooltip}">${val}</span>`;
  }

  // static iconCellRenderer(param) {
  //   let val = '';
  //   if (param.value && (param.value.url || param.value.iconId)) {
  //     let iconUrl = param.value.url
  //       ? param.context.baseHref + param.value.url
  //       : param.context.backend.getServiceBase() +
  //         '/ui/icon/' +
  //         param.value.iconId +
  //         '.svg';
  //     let label = param.value.label;
  //     val = `<img class="object-type" src="${iconUrl}" title="${label}"><span class="object-type-label">${label}</span>`;
  //   }
  //   return val;
  // }

  static emailCellRenderer(param) {
    return param.value ? `<a href="mailto:${param.value}">${Utils.escapeHtml(param.value)}</a>` : '';
  }

  static urlCellRenderer(param) {
    return param.value ? `<a target="_blank " href="${param.value}">${Utils.escapeHtml(param.value)}</a>` : '';
  }

  static dateTimeCellRenderer(param) {
    if (param.value && Array.isArray(param.value)) {
      const val = CellRenderer.dateTimeCellRendererTemplate(param.value, param.context, param.pattern);
      console.log(val);

      return val;
    } else if (param.value && !Array.isArray(param.value)) {
      return CellRenderer.dateTimeCellRendererTemplate(param.value, param.context, param.pattern);
    } else {
      return '';
    }
  }

  static dateTimeCellRendererTemplate(value, context, pattern) {
    return `<span date="${value}">${context.datePipe.transform(value, pattern)}</span>`;
  }

  static booleanCellRenderer(param) {
    let val = `<path class="null" d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z"/>`;

    if (param.value === true || param.value === 'true') {
      val = `<path class="outline" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
               <polyline class="checkmark" points="6.3,11.8 7.8,10.3 10.8,13.3 16.3,7.8 17.8,9.3 10.8,16.3 6.3,11.8"/>`;
    } else if (param.value === false || param.value === 'false') {
      val = `<path class="outline" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>`;
    }
    return `<svg class="checkbox" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">${val}</svg>`;
  }

  static multiSelectCellRenderer(param) {
    let value = param.value ? param.value : param;
    if (typeof value === 'string') {
      value = value.split(', ');
    }
    let val = '';
    if (value) {
      (Array.isArray(value) ? value : [value]).forEach(
        value => (val += typeof value === 'string' ? `<div class="chip">${Utils.escapeHtml(value)}</div>` : '  ')
      );
    }
    return val;
  }

  static linkCellRenderer(param) {
    let val = '';
    if (param.value) {
      (Array.isArray(param.value) ? param.value : [param.value]).forEach(value => {
        const query = {
          types: [param.reference.type],
          filters: {}
        };
        query.filters[param.reference.element] = {
          o: 'eq',
          v1: value
        };
        const link = Utils.buildUri('result', {
          query: encodeURIComponent(JSON.stringify(query))
        });
        val += `<div class="chip">
            <a class="link router-link" href="${link}" target="_blank" onclick="return false;">
            <svg focusable="false" class="ref-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8
            13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
            </svg>
            </a><span>${Utils.escapeHtml(value)}</span></div>`;
      });
    }
    return val;
  }

  static referenceCellRenderer(param) {
    let text = '';
    const value = param.data ? param.data[param.colDef.field] : '';
    const type = param.context.system.getObjectType(param.reference.type);
    if (!Utils.isEmpty(value) && type) {
      (Array.isArray(value) ? value : [value]).forEach((val, index) => {
        const link = 'object/' + val + '?type=' + param.reference.type;
        const iconUrl = param.context.backend.getServiceBase() + '/ui/icon/' + type.iconId + '.svg';
        const title = Array.isArray(param.value) ? param.value[index] : param.value;

        // If the user is not allowed to see the reference object or the object was deleted, we don't show the link.
        text += `<div class="chip">
          ${
            !title
              ? ''
              : `<a class="link router-link" href="${link}" target="_blank" onclick="return false;">
            <svg focusable="false" class="ref-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8
            13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
            </svg>
            </a>`
          }
          <img class="type-icon" src="${iconUrl}" title="${type.label}">
          <span>${Utils.escapeHtml(title || type.label)}</span></div>`;
      });
    }

    return text || param.value;
  }
}
