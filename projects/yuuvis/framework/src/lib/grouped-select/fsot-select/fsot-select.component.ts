import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SecondaryObjectType } from '@yuuvis/core';
import { SelectableGroup } from '../../grouped-select';

@Component({
  selector: 'yuv-fsot-select',
  templateUrl: './fsot-select.component.html',
  styleUrls: ['./fsot-select.component.scss']
})
export class FsotSelectComponent implements OnInit {
  @Input() fsots: SelectableGroup;
  @Output() fsotSelect = new EventEmitter<SecondaryObjectType>();

  constructor() {}

  ngOnInit(): void {}
}
