import { Component, Input } from '@angular/core';

@Component({
  selector: 'yuv-simple-accordion',
  templateUrl: './simple-accordion.component.html',
  styleUrls: ['./simple-accordion.component.scss']
})
export class SimpleAccordionComponent {
  showList: boolean = false;
  _toggleText: string = 'toogle';
  private _listContent: any;

  @Input('toggletxt')
  set toggleText(text: string) {
    this._toggleText = text;
  }
  get toggleText() {
    return this._toggleText;
  }
}
