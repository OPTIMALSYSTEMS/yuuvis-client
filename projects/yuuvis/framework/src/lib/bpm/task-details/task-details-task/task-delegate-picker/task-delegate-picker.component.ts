import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopoverRef } from '../../../../popover/popover.ref';

@Component({
  selector: 'yuv-task-delegate-picker',
  templateUrl: './task-delegate-picker.component.html',
  styleUrls: ['./task-delegate-picker.component.scss']
})
export class TaskDelegatePickerComponent implements OnInit {
  assignee: string;

  @Input() popover: PopoverRef;
  @Output() assigneePicked = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}
}
