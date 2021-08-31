import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InboxService, ProcessPostPayload, ProcessVariable, SystemService, Task } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../../object-form/object-form/object-form.component';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  @ViewChild(ObjectFormComponent) taskForm: ObjectFormComponent;

  private _task: Task;
  formState: FormStatusChangedEvent;

  @Input() set task(t: Task) {
    this._task = t;
    if (t.formKey) {
      // load referenced form
      this.createReferencedForm(t);
    }
  }

  formOptions: ObjectFormOptions;

  constructor(private inboxService: InboxService, private system: SystemService) {}

  private createReferencedForm(t: Task) {
    this.inboxService.getTaskForm(t.formKey).subscribe(
      (res) => {
        if (res) {
          const formData: any = {};
          if (t.variables) {
            t.variables.forEach((v) => {
              formData[v.name] = v.value;
            });
          }
          this.formOptions = {
            formModel: res,
            data: formData
          };
        }
      },
      (err) => {
        this.formOptions = null;
        console.error('Error loading referenced task form', err);
      }
    );
  }

  onFormStatusChanged(e: FormStatusChangedEvent) {
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
    const vars = this.formState && !this.formState.invalid ? this.formToProcessVars() : null;
    return vars ? { variables: vars } : {};
  }

  // map form values to process variables
  private formToProcessVars(): ProcessVariable[] {
    const formElements = this.taskForm.getFormElements();
    return Object.keys(formElements).map((k) => this.mapFormElementToProcessVar(formElements[k]));
  }

  private mapFormElementToProcessVar(formElement: any): ProcessVariable {
    const pv: ProcessVariable = {
      name: formElement.name,
      scope: 'global',
      value: null
    };
    const formValue = this.formState.data[formElement.name];
    switch (formElement.type) {
      case 'datetime': {
        pv.type = 'date';
        pv.value = (<Date>formValue).toISOString();
        break;
      }
      case 'table': {
        pv.type = 'json';
        pv.value = formValue;
        break;
      }
      default: {
        pv.type = formElement.type;
        pv.value = formValue;
      }
    }
    return pv;
  }

  //   private formValueToProcessVarValue(formElement: any): any {
  //     const formValue = this.formState.data[formElement.name];
  //     if(formElement.type === 'table') {

  //     } else if (formElement.type === 'datetime') {
  // return (<Date>formValue).toISOString();
  //     } else {
  // return formValue;
  //     }

  //     if (processVar.type === 'json') {
  //       const json: { type: string; value: any } = processVar.value;
  //       switch (json.type) {
  //         case 'table': {
  //           json.value.rows = [];
  //           formValue.forEach((formValueRow, rIndex) => {
  //             const row = [];
  //             json.value.columns.forEach((col, cIndex) => {
  //               row.push(formValueRow[col.name]);
  //             });
  //             json.value.rows.push(row);
  //           });
  //           break;
  //         }
  //       }
  //       return json;
  //     } else {
  //       return formValue;
  //     }
  //   }

  // // map process variable to form element
  // private varToFormElement(v: ProcessVariable): { element: any; value: any } {
  //   let res: { element: any; value: any } = {
  //     element: {
  //       name: v.name,
  //       type: v.type,
  //       readonly: v.readonly,
  //       label: this.system.getLocalizedResource(`${v.name}_label`) || v.name
  //     },
  //     value: v.value
  //   };

  //   // map bpm vars to form element types
  //   switch (v.type) {
  //     case 'date': {
  //       res.element.type = 'datetime';
  //       break;
  //     }
  //     case 'short': {
  //       // TODO: apply right range
  //       res.element.type = 'integer';
  //       break;
  //     }
  //     case 'json': {
  //       // json types are supposed to look like this: {type: string, value: any}
  //       const json: { type: string; value: any } = v.value;
  //       res = this.jsonVarToFormElement(res.element, json);
  //       break;
  //     }
  //   }
  //   return res;
  // }

  // // process vars of type 'json' are used as a container for other types as variables
  // private jsonVarToFormElement(formElement: any, jsonValue: { type: string; value: any }): { element: any; value: any } {
  //   const jfe: { element: any; value: any } = {
  //     element: formElement,
  //     value: null
  //   };
  //   switch (jsonValue.type) {
  //     case 'table': {
  //       /**
  //        * process var containing a table is supposed to look like this:
  //        * {
  //             "name": "test_table",
  //             "type": "json",
  //             "scope": "global",
  //             "value": {
  //               "type": "table",
  //               "value": {
  //                 "columns": [
  //                   { "name": "column_string", "type": "string" },
  //                   { "name": "column_boolean", "type": "boolean" },
  //                   { "name": "column_integer", "type": "integer" },
  //                   { "name": "column_date", "type": "date" }
  //                 ],
  //                 "rows": [
  //                   ["string #1", true, 42, "2020-10-13T12:54:26Z"],
  //                   ["string #2", true, 23, "2012-10-13T00:54:00Z"],
  //                   ["string #3", false, 24, "2021-11-19T12:30:26Z"]
  //                 ]
  //               }
  //             }
  //           }
  //       */
  //       jfe.element.type = 'table';
  //       jfe.element.elements = jsonValue.value.columns.map((c) => this.varToFormElement(c).element);
  //       jfe.value = [];
  //       jsonValue.value.rows.forEach((row, rowIndex) => {
  //         const v: { [key: string]: any } = {};
  //         jsonValue.value.columns.forEach((column, colIndex) => {
  //           v[column.name] = row[colIndex];
  //         });
  //         jfe.value.push(v);
  //       });

  //       break;
  //     }
  //   }
  //   return jfe;
  // }

  ngOnInit(): void {}
}
