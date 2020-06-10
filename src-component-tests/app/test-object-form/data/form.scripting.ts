export const formScriptingModel = {
  label: '',
  name: '',
  situation: 'EDIT',
  script: `
  scope.model["yuuvis:readonly"].onchange=togglereadonly;
  scope.model["yuuvis:required"].onchange=togglerequired;

  console.log(scope.model);

  function togglereadonly(value) {
    scope.model["yuuvis:test"].readonly = value.element.value === null ? false : !scope.model["yuuvis:test"].readonly;
  }
  
  function togglerequired(value) {
    scope.model["yuuvis:test"].required = value.element.value === null ? false : !scope.model["yuuvis:test"].required;
  }
  `,
  layout: {
    align: 'column'
  },
  layoutgroup: true,
  elements: [
    {
      label: 'core',
      _internalType: 'o2mGroup',
      layout: {
        align: 'column'
      },
      layoutgroup: false,
      elements: [
        {
          readonly: false,
          name: 'yuuvis:test',
          label: 'Input',
          description: 'scrpiting test field',
          _internalType: 'string',
          required: false
        },
        {
          readonly: false,
          name: 'yuuvis:required',
          label: 'set required',
          description: '',
          _internalType: 'boolean',
          required: false
        },
        {
          readonly: false,
          name: 'yuuvis:readonly',
          label: 'set readonly',
          description: '',
          _internalType: 'boolean',
          required: false
        }
      ]
    },
    {
      label: 'data',
      _internalType: 'o2mGroupStack',
      layout: {
        align: 'column'
      },
      layoutgroup: false
    }
  ]
};
