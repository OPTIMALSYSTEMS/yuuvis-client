import { Component, Input, OnInit } from '@angular/core';
import { InboxService, ProcessPostPayload, ProcessVariable, SystemService, Task } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  private _task: Task;
  formState: FormStatusChangedEvent;

  @Input() set task(t: Task) {
    this._task = t;
    this.formOptions = t.variables?.length ? this.varsToFormOptions(t) : null;
  }

  formOptions: ObjectFormOptions;

  constructor(private inboxService: InboxService, private system: SystemService) {}

  onFormStatusChanged(e: FormStatusChangedEvent) {
    console.log(e.data);
    this.formState = e;
  }

  update() {
    this.inboxService.updateTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  confirm() {
    this.inboxService.completeTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  private getUpdatePayload(): ProcessPostPayload {
    const vars = this.formState && this.formState.dirty && !this.formState.invalid ? this.formToProcessVars() : null;
    return vars ? { variables: vars } : {};
  }

  // map form values to process variables
  private formToProcessVars(): ProcessVariable[] {
    this._task.variables.forEach((v) => {
      v.value = this.formValueToProcessVarValue(v);
    });
    return this._task.variables;
  }

  // map former process vars of type 'json' from their form element back to json variable
  private formValueToProcessVarValue(processVar: ProcessVariable): any {
    const formValue = this.formState.data[processVar.name];
    if (processVar.type === 'json') {
      const json: { type: string; value: any } = processVar.value;
      switch (json.type) {
        case 'table': {
          json.value.rows = [];
          formValue.forEach((formValueRow, rIndex) => {
            const row = [];
            json.value.columns.forEach((col, cIndex) => {
              row.push(formValueRow[col.name]);
            });
            json.value.rows.push(row);
          });
          break;
        }
      }
      return json;
    } else {
      return formValue;
    }
  }

  // Create form model from task variables
  private varsToFormOptions(task: Task): ObjectFormOptions {
    const values: any = {};
    const coreGroupElements = task.variables.map((v) => {
      const fev = this.varToFormElement(v);
      values[v.name] = fev.value;
      return fev.element;
    });
    return {
      formModel: {
        elements: [{ type: 'o2mGroup', name: 'core', elements: coreGroupElements }]
      },
      data: values
    };
  }

  // map process variable to form element
  private varToFormElement(v: ProcessVariable): { element: any; value: any } {
    let res: { element: any; value: any } = {
      element: {
        name: v.name,
        type: v.type,
        readonly: v.readonly,
        label: this.system.getLocalizedResource(`${v.name}_label`) || v.name
      },
      value: v.value
    };

    // map bpm vars to form element types
    switch (v.type) {
      case 'date': {
        res.element.type = 'datetime';
        break;
      }
      case 'short': {
        // TODO: apply right range
        res.element.type = 'integer';
        break;
      }
      case 'json': {
        // json types are supposed to look like this: {type: string, value: any}
        const json: { type: string; value: any } = v.value;
        res = this.jsonVarToFormElement(res.element, json);
        break;
      }
    }
    return res;
  }

  // process vars of type 'json' are used as a container for other types as variables
  private jsonVarToFormElement(formElement: any, jsonValue: { type: string; value: any }): { element: any; value: any } {
    const jfe: { element: any; value: any } = {
      element: formElement,
      value: null
    };
    switch (jsonValue.type) {
      case 'table': {
        /**
         * process var containing a table is supposed to look like this:
         * {
              "name": "test_table",
              "type": "json",
              "scope": "global",  
              "value": {
                "type": "table",
                "value": {
                  "columns": [
                    { "name": "column_string", "type": "string" },
                    { "name": "column_boolean", "type": "boolean" },
                    { "name": "column_integer", "type": "integer" },
                    { "name": "column_date", "type": "date" }
                  ],
                  "rows": [
                    ["string #1", true, 42, "2020-10-13T12:54:26Z"],
                    ["string #2", true, 23, "2012-10-13T00:54:00Z"],
                    ["string #3", false, 24, "2021-11-19T12:30:26Z"]
                  ]
                }
              }
            }
        */
        jfe.element.type = 'table';
        jfe.element.elements = jsonValue.value.columns.map((c) => this.varToFormElement(c).element);
        jfe.value = [];
        jsonValue.value.rows.forEach((row, rowIndex) => {
          const v: { [key: string]: any } = {};
          jsonValue.value.columns.forEach((column, colIndex) => {
            v[column.name] = row[colIndex];
          });
          jfe.value.push(v);
        });

        break;
      }
    }
    return jfe;
  }

  ngOnInit(): void {}
}
