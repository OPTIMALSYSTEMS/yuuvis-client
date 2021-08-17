import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-task-details-attachments',
  templateUrl: './task-details-attachments.component.html',
  styleUrls: ['./task-details-attachments.component.scss']
})
export class TaskDetailsAttachmentsComponent implements OnInit {
  @Input() objectIDs: string[];

  constructor() {}

  ngOnInit(): void {}
}
