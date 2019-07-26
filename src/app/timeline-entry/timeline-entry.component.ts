import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-timeline-entry',
  templateUrl: './timeline-entry.component.html',
  styleUrls: ['./timeline-entry.component.scss']
})
export class TimelineEntryComponent implements OnInit {
  _history: any = [
    {
      time: new Date(),
      group: 'MODIFICATION',
      version: 1,
      description: 'description',
      comment: 'comment',
      user: {
        lastname: 'lastname',
        firstname: 'firstname',
        name: 'name'
      },
      parameter: {
        processName: 'processName',
        activityName: 'activityName',
        type: 'bpm'
      }
    },
    {
      time: new Date(),
      group: 'PROCESS',
      version: 1,
      description: 'description2',
      comment: 'comment2',
      user: {
        lastname: 'lastname2',
        firstname: 'firstname2',
        name: 'name2'
      },
      parameter: {
        processName: 'processName2',
        activityName: 'activityName2'
      }
    }
  ];

  @Input()
  set history(history: any[]) {
    this._history = history;
  }

  get history(): any[] {
    return this._history;
  }

  constructor() {}

  ngOnInit() {}
}
