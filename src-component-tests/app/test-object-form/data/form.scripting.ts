export const formScriptingModel = {
  label: '',
  name: '',
  situation: 'EDIT',
  script: `
  scope.model["set:readonly"].onchange=togglereadonly;
  scope.model["set:required"].onchange=togglerequired;

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
      type: 'o2mGroup',
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
          type: 'string',
          required: false
        },
        {
          readonly: false,
          name: 'set:required',
          label: 'set required',
          description: '',
          type: 'boolean',
          required: false
        },
        {
          readonly: false,
          name: 'set:readonly',
          label: 'set readonly',
          description: '',
          type: 'boolean',
          required: false
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
