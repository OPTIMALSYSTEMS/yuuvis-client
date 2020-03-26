import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-action-menu-bar',
  templateUrl: './action-menu-bar.component.html',
  styleUrls: ['./action-menu-bar.component.scss']
})
export class ActionMenuBarComponent implements OnInit {
  @Input() className = 'action';

  constructor() {}

  ngOnInit() {}
}
