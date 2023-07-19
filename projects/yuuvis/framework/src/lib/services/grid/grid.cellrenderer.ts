import { BaseObjectTypeField, Classification, SearchFilter, SearchQuery, SecondaryObjectTypeClassification, Utils } from '@yuuvis/core';
import { noAccessTitle } from '../../shared/utils';

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

  // static typeCellRenderer(param: any) {
  //   let { value } = param;
  //   const { context } = param;
  //   if (param.data && param.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]) {
  //     value = context.system.getLeadingObjectTypeID(value, param.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]);
  //   }
  //   const title = context.system.getLocalizedResource(`${value}_label`) || '';
  //   const ico = context.system.getObjectTypeIconUri(value);
  //   return `<object width="24" height="24" type="image/svg+xml" title="${title}" data="${ico}" class="svg-object">
  //   <img src="${ico}" alt="${title}">
  //   </object>`;
  // }

  static sotCellRenderer(param: any) {
    const { context, value } = param;
    return value
      ? value
          .map((v) => context.system.getSecondaryObjectType(v, true))
          .map((sot) => {
            if (sot && !sot.classification?.includes(Classification.SYSTEM_SOT)) {
              const cls = sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY) ? ' psot' : '';
              return `<div class="chip${cls}" data-sot-id="${sot.id}">${Utils.escapeHtml(sot.label)}</div>`;
            } else {
              return '';
            }
          })
          .join('')
      : '';
  }

  static systemTagsSummaryRenderer(param) {
    const titleFnc = (tag, state?) => param.context.system.getLocalizedResource(`${tag}${state ? ':' + state : ''}_label`) || state || tag;
    const i = CellRenderer.getSystemTagsRendererInput(param);
    return i.value?.length
      ? `<table class="cellrenderer-tags">${i.value
          .map(
            (v) => `<tr>
            <td class="tag_label">#${titleFnc(v[0])}</td>
            <td class="state_label">${titleFnc(v[0], v[1] + '')}</td>
            <td class="tag">${v[0]}</td>
            <td class="state">${v[1]}</td>
            <td class="date">${param.context.datePipe.transform(v[2], 'eoNiceShort')}</td>
            </tr>`
          )
          .join('')}</table>`
      : '';
  }

  static systemTagsCellRenderer(param) {
    const titleFnc = (tag, state?) => param.context.system.getLocalizedResource(`${tag}${state ? ':' + state : ''}_label`) || state || tag;
    const i = CellRenderer.getSystemTagsRendererInput(param);
    return i.value?.length ? i.value.map((v) => `<span class="chip">${titleFnc(v[0], v[1] + '')} (#${titleFnc(v[0])})</span>`).join('') : '';
  }

  private static getSystemTagsRendererInput(param): { value: any[] } {
    return {
      value: param.context.userService.isAdvancedUser
        ? param.value || []
        : param.context.system.filterVisibleTags(param.data[BaseObjectTypeField.OBJECT_TYPE_ID], param.value)
    };
  }

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
    let cssValue = '';
    if (param.value === true || param.value === 'true') {
      cssValue = ' true';
    } else if (param.value === false || param.value === 'false') {
      cssValue = ' false';
    }
    return `<div class="yuv-cr-checkbox${cssValue}"></div>`;
  }

  static booleanSwitchCellRenderer(param) {
    let cssValue = '';
    if (param.value === true || param.value === 'true') {
      cssValue = ' true';
    } else if (param.value === false || param.value === 'false') {
      cssValue = ' false';
    }
    return `<div class="yuv-cr-switch${cssValue}"></div>`;
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
                lots: [param.reference.type],
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
    let value = param.value;
    if (param.colDef && param.data[param.colDef.field + '_title']) {
      value = param.data[param.colDef.field + '_title'];
    }
    if (!Utils.isEmpty(value)) {
      text += `<div style="display: flex">`;
      (Array.isArray(value) ? value : [value]).forEach((title, index) => {
        const link = param.url ? param.url + '/' + (Array.isArray(param.value) ? param.value[index] : param.value) : null;

        // If the user is not allowed to see the reference object or the object was deleted, we don't show the link.
        text += `<div class="chip ref">
          ${
            !link
              ? ''
              : `<a class="link router-link" href="${link}" target="_blank">
            <svg focusable="false" class="ref-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8
            13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
            </svg>
            </a>`
          }
          <span>${Utils.escapeHtml(title || noAccessTitle)}</span></div>`;
      });
      text += `</div>`;
    }

    return text || param.value;
  }

  static organizationCellRenderer(param) {
    let text = '';
    let value = param.value;
    if (param.colDef && param.data[param.colDef.field + '_title']) {
      value = param.data[param.colDef.field + '_title'];
    }
    if (!Utils.isEmpty(value)) {
      text += `<div style="display: flex">`;
      (Array.isArray(value) ? value : [value]).forEach((val, index) => {
        const title = Array.isArray(value) ? value[index] : value;
        text += `<div class="chip"><span>${Utils.escapeHtml(title)}</span></div>`;
      });
      text += `</div>`;
    }

    return text || param.value;
  }
}
