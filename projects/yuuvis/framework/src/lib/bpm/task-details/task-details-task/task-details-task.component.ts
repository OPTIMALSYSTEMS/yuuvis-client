import { Component, Input, OnInit } from '@angular/core';
import { InboxService, Task, TaskData, Variable } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  private _taskData: TaskData;
  @Input() set task(t: Task) {
    console.log(t.taskData);
    this._taskData = t.taskData;
    this.formOptions = t.taskData.variables?.length ? this.varsToFormOptions(t.taskData) : null;
  }

  get taskData() {
    return this._taskData;
  }

  formOptions: ObjectFormOptions;

  constructor(private inboxService: InboxService) {}

  onFormStatusChanged(e: FormStatusChangedEvent) {
    console.log(e);
  }

  confirm() {
    this.inboxService.completeTask(this._taskData.id).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  // Create form model from task variables
  private varsToFormOptions(taskData: TaskData): ObjectFormOptions {
    const values: any = {};
    const coreGroupElements = taskData.variables.map((v) => {
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

  private varToFormElement(v: Variable): any {
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
