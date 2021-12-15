import { Component, Input, OnInit } from '@angular/core';
import { Task } from '@yuuvis/core';

@Component({
  selector: 'yuv-taskflow',
  templateUrl: './taskflow.component.html',
  styleUrls: ['./taskflow.component.scss']
})
export class TaskflowComponent implements OnInit {
  @Input() task: Task;
  constructor() {}

  ngOnInit(): void {}
}
