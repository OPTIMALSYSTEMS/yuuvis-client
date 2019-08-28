export const formModel = {
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
// export const formModel = {
//   label: 'Personnel file',
//   name: 'personalakte',
//   description: 'Personnel file',
//   situation: 'EDIT',
//   mode: 'DEFAULT',
//   script: '',
//   layout: { align: 'column' },
//   elements: [
//     {
//       type: 'o2mGroup',
//       label: 'core',
//       layout: { align: 'row' },
//       elements: [
//         {
//           type: 'o2mGroup',
//           layout: { align: 'column' },
//           elements: [
//             {
//               readonly: false,
//               name: 'klasse',
//               qname: 'personalakte.klasse',
//               hitname: 'personalakte.klasse',
//               label: 'Class',
//               description: ' ',
//               type: 'CODESYSTEM',
//               indexname: 'key_personalakte_klasse',
//               codesystem: { id: '4D25A8322FBA4538A95513088CD39674', name: 'PersonalakteKlasse' },
//               localized: true,
//               selectedforenrichment: true,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               type: 'o2mGroup',
//               layout: { align: 'column' },
//               elements: [
//                 {
//                   type: 'o2mGroup',
//                   layout: { align: 'row' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'anrede',
//                       qname: 'personalakte.anrede',
//                       hitname: 'personalakte.anrede',
//                       label: 'Form of address',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_anrede',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 30,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'titel',
//                       qname: 'personalakte.titel',
//                       hitname: 'personalakte.titel',
//                       label: 'Titel',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_titel',
//                       autocomplete: false,
//                       selectedforenrichment: true,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 },
//                 {
//                   type: 'o2mGroup',
//                   layout: { align: 'row' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'vorname',
//                       qname: 'personalakte.vorname',
//                       hitname: 'personalakte.vorname',
//                       label: 'First name',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_vorname',
//                       autocomplete: true,
//                       selectedforenrichment: true,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'name',
//                       qname: 'personalakte.name',
//                       hitname: 'personalakte.name',
//                       label: 'Family name',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_name',
//                       autocomplete: false,
//                       selectedforenrichment: true,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 },
//                 {
//                   type: 'o2mGroup',
//                   layout: { align: 'row' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'homepage',
//                       qname: 'personalakte.homepage',
//                       hitname: 'personalakte.homepage',
//                       label: 'Homepage',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_homepage',
//                       autocomplete: false,
//                       classification: 'url',
//                       selectedforenrichment: false,
//                       maxlen: 100,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'emailadresse',
//                       qname: 'personalakte.emailadresse',
//                       hitname: 'personalakte.emailadresse',
//                       label: 'E-mail address',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_emailadresse',
//                       autocomplete: false,
//                       classification: 'email',
//                       selectedforenrichment: true,
//                       maxlen: 80,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     },
//     {
//       type: 'o2mGroupStack',
//       label: 'data',
//       layout: { align: 'row' },
//       elements: [
//         {
//           type: 'o2mGroup',
//           label: 'Contact data',
//           layout: { align: 'column' },
//           elements: [
//             {
//               type: 'o2mGroupStack',
//               layout: { align: 'row' },
//               elements: [
//                 {
//                   type: 'o2mGroup',
//                   label: 'Address',
//                   layout: { align: 'column' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'strassehw',
//                       qname: 'personalakte.strassehw',
//                       hitname: 'personalakte.strassehw',
//                       label: 'Street',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_strassehw',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 40,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       type: 'o2mGroup',
//                       layout: { align: 'row' },
//                       elements: [
//                         {
//                           size: 'small',
//                           multiline: false,
//                           readonly: false,
//                           name: 'plzhw',
//                           qname: 'personalakte.plzhw',
//                           hitname: 'personalakte.plzhw',
//                           label: 'ZIP',
//                           description: ' ',
//                           type: 'STRING',
//                           indexname: 'str_personalakte_plzhw',
//                           autocomplete: false,
//                           selectedforenrichment: false,
//                           maxlen: 5,
//                           minlen: 0,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         },
//                         {
//                           size: 'small',
//                           multiline: false,
//                           readonly: false,
//                           name: 'orthw',
//                           qname: 'personalakte.orthw',
//                           hitname: 'personalakte.orthw',
//                           label: 'Town',
//                           description: ' ',
//                           type: 'STRING',
//                           indexname: 'str_personalakte_orthw',
//                           autocomplete: false,
//                           selectedforenrichment: false,
//                           maxlen: 30,
//                           minlen: 0,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         }
//                       ]
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'landhw',
//                       qname: 'personalakte.landhw',
//                       hitname: 'personalakte.landhw',
//                       label: 'Country',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_landhw',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 100,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 },
//                 {
//                   type: 'o2mGroup',
//                   label: 'Contact',
//                   layout: { align: 'column' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'telefon',
//                       qname: 'personalakte.telefon',
//                       hitname: 'personalakte.telefon',
//                       label: 'Telephone',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_telefon',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'telefax',
//                       qname: 'personalakte.telefax',
//                       hitname: 'personalakte.telefax',
//                       label: 'Telefax',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_telefax',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'funk',
//                       qname: 'personalakte.funk',
//                       hitname: 'personalakte.funk',
//                       label: 'Mobile',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_funk',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'durchwahl',
//                       qname: 'personalakte.durchwahl',
//                       hitname: 'personalakte.durchwahl',
//                       label: 'Direct dial',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_durchwahl',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 20,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: 'Optimal Systems',
//           layout: { align: 'column' },
//           elements: [
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'personalnr',
//               qname: 'personalakte.personalnr',
//               hitname: 'personalakte.personalnr',
//               label: 'Personnel No',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_personalnr',
//               autocomplete: true,
//               selectedforenrichment: true,
//               maxlen: 15,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               type: 'o2mGroup',
//               label: 'Personal data',
//               layout: { align: 'column' },
//               elements: [
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'bereich',
//                   qname: 'personalakte.bereich',
//                   hitname: 'personalakte.bereich',
//                   label: 'Devision',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_personalakte_bereich',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 50,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'team',
//                   qname: 'personalakte.team',
//                   hitname: 'personalakte.team',
//                   label: 'Team',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_personalakte_team',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 50,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'raum',
//                   qname: 'personalakte.raum',
//                   hitname: 'personalakte.raum',
//                   label: 'Raum',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_personalakte_raum',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 20,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'einstellungsdatum',
//                   qname: 'personalakte.einstellungsdatum',
//                   hitname: 'personalakte.einstellungsdatum',
//                   label: 'Date of employment',
//                   description: ' ',
//                   type: 'DATETIME',
//                   indexname: 'dte_personalakte_einstellungsdatum',
//                   withtime: false,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 }
//               ]
//             },
//             {
//               type: 'o2mGroup',
//               layout: { align: 'row' },
//               elements: [
//                 {
//                   readonly: false,
//                   name: 'aktiv',
//                   qname: 'personalakte.aktiv',
//                   hitname: 'personalakte.aktiv',
//                   label: 'Active',
//                   description: ' ',
//                   type: 'BOOLEAN',
//                   indexname: 'bol_personalakte_aktiv',
//                   selectedforenrichment: true,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'community',
//                   qname: 'personalakte.community',
//                   hitname: 'personalakte.community',
//                   label: 'Community',
//                   description: ' ',
//                   type: 'CODESYSTEM',
//                   indexname: 'key_personalakte_community',
//                   codesystem: { id: '9422C0FED99446DDA1B6D96039811C6E', name: 'communities' },
//                   localized: true,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'mikuerzel',
//                   qname: 'personalakte.mikuerzel',
//                   hitname: 'personalakte.mikuerzel',
//                   label: 'Employee code',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_personalakte_mikuerzel',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 5,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'status',
//                   qname: 'personalakte.status',
//                   hitname: 'personalakte.status',
//                   label: 'Status ',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_personalakte_status',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 50,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 }
//               ]
//             },
//             {
//               type: 'o2mGroup',
//               layout: { align: 'row' },
//               elements: [
//                 {
//                   type: 'o2mGroup',
//                   label: 'Agreements',
//                   layout: { align: 'column' },
//                   elements: [
//                     {
//                       readonly: false,
//                       name: 'endeprobezeit',
//                       qname: 'personalakte.endeprobezeit',
//                       hitname: 'personalakte.endeprobezeit',
//                       label: 'End of probation period',
//                       description: ' ',
//                       type: 'DATETIME',
//                       indexname: 'dte_personalakte_endeprobezeit',
//                       withtime: true,
//                       selectedforenrichment: false,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       type: 'o2mGroup',
//                       label: 'Working Time',
//                       layout: { align: 'row' },
//                       elements: [
//                         {
//                           readonly: false,
//                           name: 'wochenstunden',
//                           qname: 'personalakte.wochenstunden',
//                           hitname: 'personalakte.wochenstunden',
//                           label: 'Semester hours',
//                           description: ' ',
//                           type: 'NUMBER',
//                           indexname: 'dbl_personalakte_wochenstunden',
//                           scale: 1,
//                           precision: 3,
//                           grouping: false,
//                           selectedforenrichment: false,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         },
//                         {
//                           readonly: false,
//                           name: 'wochentage',
//                           qname: 'personalakte.wochentage',
//                           hitname: 'personalakte.wochentage',
//                           label: 'Weekdays',
//                           description: ' ',
//                           type: 'NUMBER',
//                           indexname: 'num_personalakte_wochentage',
//                           scale: 0,
//                           precision: 10,
//                           grouping: false,
//                           selectedforenrichment: false,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         }
//                       ]
//                     },
//                     {
//                       type: 'o2mGroup',
//                       label: 'Regulations',
//                       layout: { align: 'row' },
//                       elements: [
//                         {
//                           readonly: false,
//                           name: 'unbefristet',
//                           qname: 'personalakte.unbefristet',
//                           hitname: 'personalakte.unbefristet',
//                           label: 'unlimited',
//                           description: ' ',
//                           type: 'BOOLEAN',
//                           indexname: 'bol_personalakte_unbefristet',
//                           selectedforenrichment: false,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         },
//                         {
//                           readonly: false,
//                           name: 'zielvereinbarung',
//                           qname: 'personalakte.zielvereinbarung',
//                           hitname: 'personalakte.zielvereinbarung',
//                           label: 'Objective agreement',
//                           description: ' ',
//                           type: 'BOOLEAN',
//                           indexname: 'bol_personalakte_zielvereinbarung',
//                           selectedforenrichment: false,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         },
//                         {
//                           readonly: false,
//                           name: 'altersvorsorge',
//                           qname: 'personalakte.altersvorsorge',
//                           hitname: 'personalakte.altersvorsorge',
//                           label: 'Retirement arrangement',
//                           description: ' ',
//                           type: 'BOOLEAN',
//                           indexname: 'bol_personalakte_altersvorsorge',
//                           selectedforenrichment: false,
//                           required: false,
//                           sortable: true,
//                           searchable: true
//                         }
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: 'Banking',
//           layout: { align: 'column' },
//           elements: [
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'inhaber',
//               qname: 'personalakte.inhaber',
//               hitname: 'personalakte.inhaber',
//               label: 'Holder',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_inhaber',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 50,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'bank',
//               qname: 'personalakte.bank',
//               hitname: 'personalakte.bank',
//               label: 'Bank',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_bank',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 100,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               type: 'o2mGroup',
//               layout: { align: 'column' },
//               elements: [
//                 {
//                   type: 'o2mGroup',
//                   layout: { align: 'row' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'blz',
//                       qname: 'personalakte.blz',
//                       hitname: 'personalakte.blz',
//                       label: 'BIC1',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_blz',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 50,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'konto',
//                       qname: 'personalakte.konto',
//                       hitname: 'personalakte.konto',
//                       label: 'Account',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_konto',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 50,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 },
//                 {
//                   type: 'o2mGroup',
//                   layout: { align: 'row' },
//                   elements: [
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'iban',
//                       qname: 'personalakte.iban',
//                       hitname: 'personalakte.iban',
//                       label: 'IBAN',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_iban',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 22,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     },
//                     {
//                       size: 'small',
//                       multiline: false,
//                       readonly: false,
//                       name: 'bic',
//                       qname: 'personalakte.bic',
//                       hitname: 'personalakte.bic',
//                       label: 'BIC',
//                       description: ' ',
//                       type: 'STRING',
//                       indexname: 'str_personalakte_bic',
//                       autocomplete: false,
//                       selectedforenrichment: false,
//                       maxlen: 11,
//                       minlen: 0,
//                       required: false,
//                       sortable: true,
//                       searchable: true
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: 'Private data',
//           layout: { align: 'column' },
//           elements: [
//             {
//               readonly: false,
//               name: 'gebdat',
//               qname: 'personalakte.gebdat',
//               hitname: 'personalakte.gebdat',
//               label: 'Date of birth',
//               description: ' ',
//               type: 'DATETIME',
//               indexname: 'dte_personalakte_gebdat',
//               withtime: true,
//               selectedforenrichment: false,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               readonly: false,
//               name: 'anzahlkinder',
//               qname: 'personalakte.anzahlkinder',
//               hitname: 'personalakte.anzahlkinder',
//               label: 'Number of children',
//               description: ' ',
//               type: 'NUMBER',
//               indexname: 'num_personalakte_anzahlkinder',
//               scale: 0,
//               precision: 10,
//               grouping: false,
//               selectedforenrichment: false,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'nationalitaet',
//               qname: 'personalakte.nationalitaet',
//               hitname: 'personalakte.nationalitaet',
//               label: 'Nationality',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_nationalitaet',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 40,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: 'Curriculum Vitae',
//           layout: { align: 'column' },
//           elements: [
//             {
//               size: 'small',
//               readonly: true,
//               name: 'werdegang',
//               qname: 'personalakte.werdegang',
//               hitname: 'personalakte.werdegang',
//               label: 'curriculum vitae',
//               description: ' ',
//               type: 'TABLE',
//               indexname: 'tab_personalakte_werdegang',
//               required: false,
//               elements: [
//                 {
//                   readonly: false,
//                   name: 'bis',
//                   qname: 'personalakte.werdegang.bis',
//                   hitname: 'personalakte.werdegang.bis',
//                   label: 'until',
//                   description: 'Date of Leave',
//                   type: 'DATETIME',
//                   indexname: 'dte_bis',
//                   withtime: false,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'codesystementry',
//                   qname: 'personalakte.werdegang.codesystementry',
//                   hitname: 'personalakte.werdegang.codesystementry',
//                   label: 'codesystementry',
//                   description: ' ',
//                   type: 'CODESYSTEM',
//                   indexname: 'key_codesystementry',
//                   codesystem: { id: '20E71BF6B78D42F7B54083B7C5777D71', name: 'Firma' },
//                   localized: true,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'position',
//                   qname: 'personalakte.werdegang.position',
//                   hitname: 'personalakte.werdegang.position',
//                   label: 'Position',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_position',
//                   autocomplete: true,
//                   selectedforenrichment: false,
//                   maxlen: 50,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'von',
//                   qname: 'personalakte.werdegang.von',
//                   hitname: 'personalakte.werdegang.von',
//                   label: 'from',
//                   description: 'Date of entry',
//                   type: 'DATETIME',
//                   indexname: 'dte_von',
//                   withtime: false,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   size: 'small',
//                   multiline: false,
//                   readonly: false,
//                   name: 'firmenwerdegang',
//                   qname: 'personalakte.werdegang.firmenwerdegang',
//                   hitname: 'personalakte.werdegang.firmenwerdegang',
//                   label: 'Company',
//                   description: ' ',
//                   type: 'STRING',
//                   indexname: 'str_firmenwerdegang',
//                   autocomplete: false,
//                   selectedforenrichment: false,
//                   maxlen: 50,
//                   minlen: 0,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'datetime',
//                   qname: 'personalakte.werdegang.datetime',
//                   hitname: 'personalakte.werdegang.datetime',
//                   label: 'Datetime',
//                   description: ' ',
//                   type: 'DATETIME',
//                   indexname: 'dte_datetime',
//                   withtime: true,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'boolean',
//                   qname: 'personalakte.werdegang.boolean',
//                   hitname: 'personalakte.werdegang.boolean',
//                   label: 'boolean',
//                   description: ' ',
//                   type: 'BOOLEAN',
//                   indexname: 'bol_boolean',
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 },
//                 {
//                   readonly: false,
//                   name: 'decimal',
//                   qname: 'personalakte.werdegang.decimal',
//                   hitname: 'personalakte.werdegang.decimal',
//                   label: 'decimal',
//                   description: ' ',
//                   type: 'NUMBER',
//                   indexname: 'num_decimal',
//                   scale: 2,
//                   precision: 12,
//                   grouping: false,
//                   selectedforenrichment: false,
//                   required: false,
//                   sortable: true,
//                   searchable: true
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: 'Education',
//           layout: { align: 'column' },
//           elements: [
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'schulabschluss',
//               qname: 'personalakte.schulabschluss',
//               hitname: 'personalakte.schulabschluss',
//               label: 'Graduation',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_schulabschluss',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 50,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'studienbezeichnung',
//               qname: 'personalakte.studienbezeichnung',
//               hitname: 'personalakte.studienbezeichnung',
//               label: 'Course of studies',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_studienbezeichnung',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 50,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'studienabschluss',
//               qname: 'personalakte.studienabschluss',
//               hitname: 'personalakte.studienabschluss',
//               label: 'Final degree',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_studienabschluss',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 50,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'institut',
//               qname: 'personalakte.institut',
//               hitname: 'personalakte.institut',
//               label: 'Institute',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_institut',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 100,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             },
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'berufsausbildung',
//               qname: 'personalakte.berufsausbildung',
//               hitname: 'personalakte.berufsausbildung',
//               label: 'Professional education',
//               description: ' ',
//               type: 'STRING',
//               indexname: 'str_personalakte_berufsausbildung',
//               autocomplete: false,
//               selectedforenrichment: false,
//               maxlen: 50,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             }
//           ]
//         },
//         {
//           type: 'o2mGroup',
//           label: '...',
//           layout: { align: 'column' },
//           elements: [
//             {
//               size: 'small',
//               multiline: false,
//               readonly: false,
//               name: 'maindoc',
//               qname: 'personalakte.maindoc',
//               hitname: 'personalakte.maindoc',
//               label: 'Main document',
//               type: 'STRING',
//               indexname: 'str_personalakte_maindoc',
//               autocomplete: false,
//               reference: { element: 'basicdocument.titel', type: 'basicdocument' },
//               selectedforenrichment: false,
//               maxlen: 200,
//               minlen: 0,
//               required: false,
//               sortable: true,
//               searchable: true
//             }
//           ]
//         }
//       ]
//     }
//   ]
// };
