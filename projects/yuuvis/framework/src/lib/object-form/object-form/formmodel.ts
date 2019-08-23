export const formModel = {
  label: 'ID Picture',
  name: 'passfoto',
  description: 'ID Picture',
  situation: 'EDIT',
  mode: 'DEFAULT',
  script: '',
  layout: { align: 'column' },
  elements: [
    {
      type: 'o2mGroup',
      label: 'core',
      layout: { align: 'column' },
      elements: [
        {
          size: 'small',
          multiline: false,
          readonly: false,
          name: 'titel',
          qname: 'passfoto.titel',
          hitname: 'passfoto.titel',
          label: 'Title',
          description: ' ',
          type: 'STRING',
          indexname: 'str_passfoto_titel',
          autocomplete: false,
          selectedforenrichment: false,
          maxlen: 250,
          minlen: 0,
          required: false,
          sortable: true,
          searchable: true
        }
      ]
    },
    {
      type: 'o2mGroupStack',
      label: 'data',
      layout: { align: 'column' },
      elements: [
        {
          type: 'o2mGroup',
          label: 'Size',
          layout: { align: 'row' },
          elements: [
            {
              readonly: false,
              name: 'width',
              qname: 'passfoto.width',
              hitname: 'passfoto.width',
              label: 'Width',
              description: ' ',
              type: 'NUMBER',
              indexname: 'num_passfoto_width',
              defaultvaluefunction: 'EXTRACTION',
              defaultvaluefunctionparameter: 'OS:ImageWidth',
              scale: 0,
              precision: 10,
              grouping: false,
              selectedforenrichment: false,
              required: false,
              sortable: true,
              searchable: true
            },
            {
              readonly: false,
              name: 'height',
              qname: 'passfoto.height',
              hitname: 'passfoto.height',
              label: 'Height',
              description: ' ',
              type: 'NUMBER',
              indexname: 'num_passfoto_height',
              defaultvaluefunction: 'EXTRACTION',
              defaultvaluefunctionparameter: 'OS:ImageHeight',
              scale: 0,
              precision: 10,
              grouping: false,
              selectedforenrichment: false,
              required: false,
              sortable: true,
              searchable: true
            }
          ]
        }
      ]
    }
  ]
};
