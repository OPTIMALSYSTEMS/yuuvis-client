export const formSingleModel = {
  label: 'QA-DocAllSingleFields',
  name: 'tenKolibri:qadocallsinglefields',
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
          name: 'tenKolibri:strsinglemin5max10required',
          label: 'Zeichenkette',
          description: 'min 5 - max 10 - Pflicht',
          _internalType: 'string',
          defaultvalue: ['value'],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:intsinglemin11max99required',
          label: 'Ganze Zahl beschränkt',
          description: 'min 11 - max 999 - Pflicht',
          _internalType: 'integer',
          defaultvalue: [20],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:intsingle',
          label: 'Ganze Zahl',
          description: 'unbeschränkt',
          _internalType: 'integer',
          required: false
        },
        {
          readonly: false,
          name: 'tenKolibri:decsinglemin1111max9999required',
          label: 'Dezimalzahl beschränkt',
          description: 'min 11.11 - max 99.99 - Pflicht',
          _internalType: 'decimal',
          defaultvalue: [12.34],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:decsingle',
          label: 'Dezimalzahl',
          description: 'unbeschränkt',
          _internalType: 'decimal',
          required: false
        },
        {
          readonly: false,
          name: 'tenKolibri:datetimesinglerequired',
          label: 'Datum & Zeit',
          description: 'Pflicht',
          _internalType: 'datetime',
          defaultvalue: ['2019-04-17T14:59:00.000Z'],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:booleanrequiredtrue',
          label: 'Boolean',
          description: 'Pflicht',
          _internalType: 'boolean',
          defaultvalue: [true],
          required: true
        },
        {
          readonly: false,
          name: 'tenKolibri:booleannull',
          label: 'Boolean Tri-State',
          description: 'Null erlaubt',
          _internalType: 'boolean',
          required: false
        },
        {
          readonly: false,
          name: 'tenKolibri:roles',
          label: 'Rollen',
          _internalType: 'string',
          required: false
        },
        {
          readonly: false,
          name: 'clienttitle',
          label: 'Titel',
          _internalType: 'string',
          required: true
        },
        {
          readonly: false,
          name: 'clientdescription',
          label: 'Beschreibung',
          _internalType: 'string',
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
