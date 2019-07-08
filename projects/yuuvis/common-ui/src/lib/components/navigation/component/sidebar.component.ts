import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Position } from '../navigation.enum';

@Component({
  selector: 'yuv-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private _display = true;
  private _position: Position = Position.LEFT;

  @Input()
  set display(val: boolean) {
    this._display = val;
  }
  get display(): boolean {
    return this._display;
  }

  @Input()
  set position(pos: Position) {
    this._position = pos;
  }
  get position(): Position {
    return this._position;
  }

  constructor(private router: Router) {}

  onHide() {
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  ngOnInit() {}
}
