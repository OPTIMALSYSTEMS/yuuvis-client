import { Component, OnInit } from '@angular/core';
import { DmsObject, SystemService } from '@yuuvis/core';
import { FormStatusChangedEvent } from '@yuuvis/framework';
import { booleanElements } from './data/form.boolean';
import { catalogElements } from './data/form.catalog';
import { datetimeElements } from './data/form.datetime';
import { dynamicCatalogElements } from './data/form.dynamic-catalog';
import { groupingModel } from './data/form.grouping';
import { numberElements } from './data/form.numbers';
import { organizationElements } from './data/form.organization';
import { referenceElements } from './data/form.reference';
import { formScriptingModel } from './data/form.scripting';
import { stringElements } from './data/form.string';

@Component({
  selector: 'yuv-test-object-form',
  templateUrl: './test-object-form.component.html',
  styleUrls: ['./test-object-form.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectFormComponent implements OnInit {
  showData: boolean;
  formModels = [
    {
      label: 'Form groups',
      model: {
        formModel: groupingModel,
        data: {}
      }
    },
    {
      label: 'Dynamic catalog component',
      model: {
        formModel: this.wrap(dynamicCatalogElements),
        data: { germanstates: 'Berlin' }
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
          'datetime:with:value': '2019-04-17T14:59:00.000Z',
          'date:with:value': '2019-04-17T14:59:00.000Z',
          'datetime:disabled:with:value': '2019-04-17T14:59:00.000Z'
        }
      }
    },
    {
      label: 'DatetimeRange component (SEARCH)',
      model: {
        formModel: this.wrap(datetimeElements, 'SEARCH')
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
      label: 'NumberRange components (SEARCH)',
      model: {
        formModel: this.wrap(numberElements, 'SEARCH'),
        data: {}
      }
    },
    {
      label: 'Form Scripting',
      model: {
        formModel: formScriptingModel,
        data: {}
      }
    },
    {
      label: 'ID References',
      model: {
        formModel: this.wrap(referenceElements),
        data: {
          'id:reference:value': ['d50256d1-6502-40c4-b8da-626793d5ab12', 'shouldfail'],
          'id:reference:readonly': ['d50256d1-6502-40c4-b8da-626793d5ab12', 'shouldfail']
        }
      }
    },
    {
      label: 'ID Organization',
      model: {
        formModel: this.wrap(organizationElements),
        data: {
          'id:organization:value': ['a69a0eb6-3662-4c00-8096-38fbb2c4a922', 'the-id'],
          'id:organization:readonly': ['the-id', 'a69a0eb6-3662-4c00-8096-38fbb2c4a922']
        }
      }
    },
    {
      label: 'Catalog',
      model: {
        formModel: this.wrap(catalogElements),
        data: {
          catalog: 'Zwei',
          'catalog:readonly:multi': ['Hund', 'Katze'],
          'catalog:readonly': 'Esel'
        }
      }
    }
  ];

  currentModel = this.formModels[0].model;
  busy: boolean;
  data = {};

  constructor(private systemService: SystemService) {}

  setModel(model) {
    this.currentModel = model;
  }

  setDmsObject(dmsObject: DmsObject) {
    this.busy = true;
    this.systemService.getObjectTypeForm(dmsObject.objectTypeId, 'EDIT').subscribe(
      (model) => {
        this.currentModel = {
          formModel: model,
          data: dmsObject.data
        };
        this.busy = false;
      },
      (err) => {
        this.busy = false;
      }
    );
  }

  private wrap(elements: any[], situation?: string) {
    return {
      label: '',
      name: '',
      situation: situation || 'EDIT',
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

  onFormStatusChanged(formState: FormStatusChangedEvent) {
    this.data = JSON.stringify(formState.data, null, 2);
  }

  ngOnInit() {}
}
