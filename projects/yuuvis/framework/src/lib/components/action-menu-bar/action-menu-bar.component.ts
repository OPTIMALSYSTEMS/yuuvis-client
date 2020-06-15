import { Component, Input, OnInit } from '@angular/core';
/**
 * Creates an action menu bar for selected item.
 * @example
 * <yuv-action-menu-bar class="actions"></uv-action-menu-bar>

 */
@Component({
  selector: 'yuv-action-menu-bar',
  templateUrl: './action-menu-bar.component.html',
  styleUrls: ['./action-menu-bar.component.scss']
})
export class ActionMenuBarComponent implements OnInit {
  /**
   * Set the css-class `action` and provides it's styling
   */
  @Input() className = 'action';

  constructor() {}

  ngOnInit() {}
}
