import { BaseObjectTypeField, SearchFilter, SearchQuery, SecondaryObjectTypeClassification, Utils } from '@yuuvis/core';

/**
 * @ignore
 * Collection of renderers to be used within ag-grid.
 */
export class CellRenderer {
  static render(type: string, param: any) {
    return CellRenderer[type + 'CellRenderer'](param);
  }

  static filesizeCellRenderer(param) {
    return param.value ? param.context.fileSizePipe.transform(param.value) : '';
  }

  static numberCellRenderer(param) {
    if (param.value || param.value === 0) {
      const { value, context, scale, grouping, pattern } = param;
      const transform = (val) => context.numberPipe.transform(val, grouping, pattern, scale, `1.${scale || 0}-${scale || 0}`);
      return Array.isArray(value) ? CellRenderer.multiSelectCellRenderer(value.map((val) => transform(val))) : transform(value);
    }
    return '';
  }

  static typeCellRenderer(param: any) {
    let { value } = param;
    const { context } = param;

    if (param.data && param.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]) {
      value = context.system.getLeadingObjectTypeID(value, param.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]);
    }

    const ico = context.system.getObjectTypeIcon(value) || '';
    const title = context.system.getLocalizedResource(`${value}_label`) || '';
    return `<span title="${title}">${ico}</span>`;
  }

  static sotCellRenderer(param: any) {
    const { context, value } = param;
    return value
      ? value
          .map((v) => context.system.getSecondaryObjectType(v, true))
          .map((sot) => {
            if (sot) {
              const cls = sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY) ? ' psot' : '';
              return `<div class="chip${cls}">${Utils.escapeHtml(sot.label)}</div>`;
            } else {
              return '';
            }
          })
          .join('')
      : '';
  }

  // static iconCellRenderer(param) {
  //   let val = '';
  //   if (param.value && (param.value.url || param.value.iconId)) {
  //     let iconUrl = param.value.url
  //       ? Utils.getBaseHref() + param.value.url
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
    return param.value ? `<a href="mailto:${Utils.formatMailTo(param?.value, true)}">${Utils.escapeHtml(param.value)}</a>` : '';
  }

  static phoneCellRenderer(param) {
    return param.value ? `<a href="tel:${param.value}">${Utils.escapeHtml(param.value)}</a>` : '';
  }

  static urlCellRenderer(param) {
    return param.value ? `<a target="_blank " href="${param.value}">${Utils.escapeHtml(param.value)}</a>` : '';
  }

  static dateTimeCellRenderer(param) {
    if (param.value) {
      const { value, context, pattern } = param;
      const transform = (val) => context.datePipe.transform(val, pattern);
      return `<span date="${value}">${
        Array.isArray(value) ? CellRenderer.multiSelectCellRenderer(value.map((val) => transform(val))) : transform(value)
      }</span>`;
    }
    return '';
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

  static multiSelectCellRenderer(param: any) {
    let value = Array.isArray(param) ? param : param && param.value;
    if (value || value === 0) {
      if (typeof value === 'string') {
        value = value.split(', ');
      }
      return (Array.isArray(value) ? value : [value])
        .map((val) => `<div class="chip">${Utils.escapeHtml(val && val.toString ? val.toString() : ' ')}</div>`)
        .join('');
    }
    return '';
  }

  static linkCellRenderer(param) {
    let val = '';
    if (param.value) {
      (Array.isArray(param.value) ? param.value : [param.value]).forEach((value) => {
        const link = Utils.buildUri('result', {
          query: encodeURIComponent(
            JSON.stringify(
              new SearchQuery({
                types: [param.reference.type],
                filters: [new SearchFilter(param.reference.element, SearchFilter.OPERATOR.EQUAL, value).toQuery()]
              }).toQueryJson()
            )
          )
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
