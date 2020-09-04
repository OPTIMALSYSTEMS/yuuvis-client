import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SecondaryObjectType } from '@yuuvis/core';

@Component({
  selector: 'yuv-fsot-picker',
  templateUrl: './fsot-picker.component.html',
  styleUrls: ['./fsot-picker.component.scss']
})
export class FsotPickerComponent implements OnInit {
  @Input() title: string;
  @Input() items: SecondaryObjectType[];
  @Output() select = new EventEmitter<SecondaryObjectType>();

  constructor() {}

  ngOnInit(): void {}
}
