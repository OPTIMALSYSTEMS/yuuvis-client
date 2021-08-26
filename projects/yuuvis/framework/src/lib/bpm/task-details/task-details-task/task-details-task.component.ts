import { Component, Input, OnInit } from '@angular/core';
import { InboxService, ProcessVariable, Task } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  private _task: Task;
  @Input() set task(t: Task) {
    this._task = t;
    this.formOptions = t.variables?.length ? this.varsToFormOptions(t) : null;
  }

  formOptions: ObjectFormOptions;

  constructor(private inboxService: InboxService) {}

  onFormStatusChanged(e: FormStatusChangedEvent) {
    console.log(e);
  }

  confirm() {
    this.inboxService.completeTask(this._task.id).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  // Create form model from task variables
  private varsToFormOptions(task: Task): ObjectFormOptions {
    const values: any = {};
    const coreGroupElements = task.variables.map((v) => {
      values[v.name] = v.value;
      return this.varToFormElement(v);
    });
    return {
      formModel: {
        elements: [{ type: 'o2mGroup', name: 'core', elements: coreGroupElements }]
      },
      data: values
    };
  }

  private varToFormElement(v: ProcessVariable): any {
    const fe = {
      name: v.name,
      type: v.type,
      readonly: true,
      label: v.name
    };

    // map bpm vars to form element types
    switch (v.type) {
      case 'date': {
        fe.type = 'datetime';
        break;
      }
      case 'short': {
        // TODO: apply right range
        fe.type = 'integer';
        break;
      }
    }
    return fe;
  }

  ngOnInit(): void {}
}
