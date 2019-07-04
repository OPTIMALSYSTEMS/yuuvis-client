import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private _display = true;

  @Input()
  set display(val: boolean) {
    this._display = val;
  }
  get display(): boolean {
    return this._display;
  }

  constructor() {}
  ngOnInit() {}
}
