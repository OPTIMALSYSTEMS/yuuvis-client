import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'yuv-indexdata-entry',
  templateUrl: './indexdata-entry.component.html',
  styleUrls: ['./indexdata-entry.component.scss']
})
export class IndexdataEntryComponent {
  _className = 'entry';
  @Input() label: string;
  @Input() value: any = { id: '', version: '', type: '' };
  @Input() innerValue: string;
  @Input() item: any;
  @Input() enableVersions = true; //false;

  @Input()
  set className(className) {
    this._className = `${this._className} ${className}`;
  }

  get className() {
    return this._className;
  }

  @Input() showEntry = true;
  @Output() onValueClicked: EventEmitter<any> = new EventEmitter<any>();

  onValueClick(event, item) {
    this.onValueClicked.emit({ event, item });
  }
}
