export const groupingModel = {
  label: 'Personnel file',
  name: 'personalakte',
  description: 'Personnel file',
  situation: 'SEARCH',
  mode: 'DEFAULT',
  layout: { align: 'column' },
  elements: [
    {
      type: 'o2mGroup',
      label: 'core',
      layout: { align: 'row' },
      elements: [
        {
          type: 'o2mGroup',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:1',
              label: 'String No. 2',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              type: 'o2mGroup',
              layout: { align: 'column' },
              elements: [
                {
                  type: 'o2mGroup',
                  layout: { align: 'row' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:2',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:3',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                },
                {
                  type: 'o2mGroup',
                  layout: { align: 'row' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:4',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:5',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                },
                {
                  type: 'o2mGroup',
                  layout: { align: 'row' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:6',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:7',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'o2mGroupStack',
      label: 'data',
      layout: { align: 'row' },
      elements: [
        {
          type: 'o2mGroup',
          label: 'Contact data',
          layout: { align: 'column' },
          elements: [
            {
              type: 'o2mGroupStack',
              layout: { align: 'row' },
              elements: [
                {
                  type: 'o2mGroup',
                  label: 'Address',
                  layout: { align: 'column' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:8',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      type: 'o2mGroup',
                      layout: { align: 'row' },
                      elements: [
                        {
                          readonly: false,
                          name: 'string:9',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        },
                        {
                          readonly: false,
                          name: 'string:10',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        }
                      ]
                    },
                    {
                      readonly: false,
                      name: 'string:11',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                },
                {
                  type: 'o2mGroup',
                  label: 'Contact',
                  layout: { align: 'column' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:12',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:13',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:14',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:15',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'o2mGroup',
          label: 'Optimal Systems',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:16',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              type: 'o2mGroup',
              label: 'Personal data',
              layout: { align: 'column' },
              elements: [
                {
                  readonly: false,
                  name: 'string:17',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:18',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:19',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:20',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                }
              ]
            },
            {
              type: 'o2mGroup',
              layout: { align: 'row' },
              elements: [
                {
                  readonly: false,
                  name: 'string:21',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:22',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:23',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                },
                {
                  readonly: false,
                  name: 'string:24',
                  label: 'String',
                  description: '',
                  _internalType: 'string',
                  required: false
                }
              ]
            },
            {
              type: 'o2mGroup',
              layout: { align: 'row' },
              elements: [
                {
                  type: 'o2mGroup',
                  label: 'Agreements',
                  layout: { align: 'column' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:25',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      type: 'o2mGroup',
                      label: 'Working Time',
                      layout: { align: 'row' },
                      elements: [
                        {
                          readonly: false,
                          name: 'string:26',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        },
                        {
                          readonly: false,
                          name: 'string:27',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        }
                      ]
                    },
                    {
                      type: 'o2mGroup',
                      label: 'Regulations',
                      layout: { align: 'row' },
                      elements: [
                        {
                          readonly: false,
                          name: 'string:28',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        },
                        {
                          readonly: false,
                          name: 'string:29',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        },
                        {
                          readonly: false,
                          name: 'string:30',
                          label: 'String',
                          description: '',
                          _internalType: 'string',
                          required: false
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'o2mGroup',
          label: 'Banking',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:31',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              readonly: false,
              name: 'string:32',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              type: 'o2mGroup',
              layout: { align: 'column' },
              elements: [
                {
                  type: 'o2mGroup',
                  layout: { align: 'row' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:33',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:34',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                },
                {
                  type: 'o2mGroup',
                  layout: { align: 'row' },
                  elements: [
                    {
                      readonly: false,
                      name: 'string:35',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    },
                    {
                      readonly: false,
                      name: 'string:36',
                      label: 'String',
                      description: '',
                      _internalType: 'string',
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'o2mGroup',
          label: 'Private data',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:37',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              readonly: false,
              name: 'string:38',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            },
            {
              readonly: false,
              name: 'string:39',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            }
          ]
        },
        {
          type: 'o2mGroup',
          label: 'Curriculum Vitae',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:40',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            }
          ]
        },
        {
          type: 'o2mGroup',
          label: 'Education',
          layout: { align: 'column' },
          elements: [
            {
              readonly: false,
              name: 'string:41',
              label: 'String',
              description: '',
              _internalType: 'string',
              required: false
            }
          ]
        }
      ]
    }
  ]
};
