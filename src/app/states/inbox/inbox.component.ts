import { Component, OnInit } from '@angular/core';
import { BpmService } from '@yuuvis/core';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  constructor(private bpmService: BpmService) {}

  ngOnInit(): void {}
}
