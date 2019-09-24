import { Component, OnInit } from '@angular/core';
import { booleanElements } from './data/form.boolean';
import { datetimeElements } from './data/form.datetime';
import { groupingModel } from './data/form.grouping';
import { numberElements } from './data/form.numbers';
import { formScriptingModel } from './data/form.scripting';
import { stringElements } from './data/form.string';

@Component({
  selector: 'yuv-test-object-form',
  templateUrl: './test-object-form.component.html',
  styleUrls: ['./test-object-form.component.scss']
})
export class TestObjectFormComponent implements OnInit {
  formModels = [
    {
      label: 'Form groups',
      model: {
        formModel: groupingModel,
        data: {}
      }
    },
    {
      label: 'String component',
      model: {
        formModel: this.wrap(stringElements),
        data: {}
      }
    },
    {
      label: 'Checkbox component',
      model: {
        formModel: this.wrap(booleanElements),
        data: {
          'boolean:readonlyvalue': true
        }
      }
    },
    {
      label: 'Datetime component',
      model: {
        formModel: this.wrap(datetimeElements),
        data: {
          'datetime:three': '2019-04-17T14:59:00.000Z',
          'datetime:four:width:value': '2019-04-17T14:59:00.000Z',
          'datetime:disabled:with:value': '2019-04-17T14:59:00.000Z'
        }
      }
    },
    {
      label: 'Number components',
      model: {
        formModel: this.wrap(numberElements),
        data: {}
      }
    },
    {
      label: 'Form Scripting',
      model: {
        formModel: formScriptingModel,
        data: {}
      }
    }
  ];

  currentModel = this.formModels[0].model;

  constructor() {}

  setModel(model) {
    this.currentModel = model;
  }

  private wrap(elements: any[]) {
    return {
      label: '',
      name: '',
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
          elements: elements
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
  }

  ngOnInit() {}
}
