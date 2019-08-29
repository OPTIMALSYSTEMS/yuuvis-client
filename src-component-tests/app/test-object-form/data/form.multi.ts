export const formMultiModel = {
  label: 'QA-DocAllMultiFields',
  name: 'tenKolibri:qadocallmultifields',
  situation: 'EDIT',
  layout: {
    align: 'column'
  },
  layoutgroup: true,
  elements: [
    {
      label: 'core',
      type: 'o2mGroup',
      layout: {
        align: 'column'
      },
      layoutgroup: false,
      elements: [
        {
          readonly: false,
          name: 'tenKolibri:strmultimin5max10required',
          label: 'Zeichenkette mehrfach',
          description: 'min 5 - min 10 - Pflicht',
          type: 'string',
          defaultvalue: ['value'],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:intmultimin11max99required',
          label: 'Ganze Zahl mehrfach',
          description: 'min 11 - max 99999 - Pflicht',
          type: 'integer',
          defaultvalue: [20],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:decmultimin1111max9999required',
          label: 'Dezimalzahl mehrfach',
          description: 'min 11.11 - max 99999.99 - Pflicht',
          type: 'decimal',
          defaultvalue: [12.34],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:datetimemultirequired',
          label: 'Datum & Zeit',
          description: 'Pflicht',
          type: 'datetime',
          withTime: true,
          defaultvalue: ['2019-04-17T14:59:00.000Z'],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:roles',
          label: 'Rollen',
          type: 'string',
          required: false
        },
        {
          readonly: false,
          name: 'clienttitle',
          label: 'Titel',
          type: 'string',
          required: true
        },
        {
          readonly: false,
          name: 'clientdescription',
          label: 'Beschreibung',
          type: 'string',
          required: true
        }
      ]
    },
    {
      label: 'data',
      type: 'o2mGroupStack',
      layout: {
        align: 'column'
      },
      layoutgroup: false
    }
  ]
};
